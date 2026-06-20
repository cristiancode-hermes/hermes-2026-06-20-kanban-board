import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Card } from './card.entity';
import { ColumnEntity } from '../columns/column.entity';
import { Board } from '../boards/board.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { ActivitiesService } from '../activities/activities.service';
import { SseService } from '../sse/sse.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(ColumnEntity)
    private columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private activitiesService: ActivitiesService,
    private sseService: SseService,
  ) {}

  async findByBoard(boardId: number): Promise<Card[]> {
    return this.cardRepository.find({
      where: { boardId },
      relations: { column: true, assignee: true },
      order: { position: 'ASC' },
    });
  }

  async create(dto: CreateCardDto, userId: number): Promise<Card> {
    const column = await this.columnRepository.findOne({
      where: { id: dto.columnId },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const boardId = column.boardId;

    // Auto-assign position at the end of the column
    const maxPosition = await this.cardRepository
      .createQueryBuilder('card')
      .where('card.column_id = :columnId', { columnId: dto.columnId })
      .select('MAX(card.position)', 'max')
      .getRawOne();
    const position = (maxPosition?.max ?? -1) + 1;

    const cardData: DeepPartial<Card> = {
      title: dto.title,
      description: dto.description || '',
      position,
      columnId: dto.columnId,
      boardId,
      assigneeId: dto.assigneeId || null,
      dueDate: dto.dueDate || null,
      labels: dto.labels ? JSON.stringify(dto.labels) : null,
    };

    const card = this.cardRepository.create(cardData);
    const savedCard = await this.cardRepository.save(card);

    // Activity log
    await this.activitiesService.create({
      boardId,
      userId,
      action: 'created',
      entityType: 'card',
      entityId: savedCard.id,
      metadata: JSON.stringify({ title: dto.title, columnId: dto.columnId }),
    });

    // SSE event
    this.sseService.emit(boardId, {
      type: 'card:created',
      data: savedCard,
    });

    const result = await this.cardRepository.findOne({
      where: { id: savedCard.id },
      relations: { column: true, assignee: true },
    });
    return result as Card;
  }

  async findById(id: number): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: { column: true, assignee: true, board: true },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return card;
  }

  async update(id: number, dto: UpdateCardDto, userId: number): Promise<Card> {
    const card = await this.findById(id);

    if (dto.title !== undefined) card.title = dto.title;
    if (dto.description !== undefined) card.description = dto.description;
    if (dto.assigneeId !== undefined) card.assigneeId = dto.assigneeId;
    if (dto.dueDate !== undefined) card.dueDate = dto.dueDate;
    if (dto.labels !== undefined) card.labels = JSON.stringify(dto.labels);

    const savedCard = await this.cardRepository.save(card);

    // Activity log
    await this.activitiesService.create({
      boardId: card.boardId,
      userId,
      action: 'updated',
      entityType: 'card',
      entityId: card.id,
      metadata: JSON.stringify({ before: undefined, after: dto }),
    });

    // SSE event
    this.sseService.emit(card.boardId, {
      type: 'card:updated',
      data: savedCard,
    });

    const result = await this.cardRepository.findOne({
      where: { id: savedCard.id },
      relations: { column: true, assignee: true },
    });
    return result as Card;
  }

  async moveCard(id: number, dto: MoveCardDto, userId: number): Promise<Card> {
    const card = await this.findById(id);
    const oldColumnId = card.columnId;
    const oldPosition = card.position;
    const newColumnId = dto.columnId;
    const newPosition = dto.position;

    if (oldColumnId === newColumnId) {
      // Same column: reorder within
      if (newPosition > oldPosition) {
        // Moving down: shift cards between oldPosition+1 and newPosition up
        await this.cardRepository
          .createQueryBuilder()
          .update(Card)
          .set({ position: () => '"position" - 1' })
          .where(
            'column_id = :columnId AND position > :oldPos AND position <= :newPos',
            { columnId: oldColumnId, oldPos: oldPosition, newPos: newPosition },
          )
          .execute();
      } else if (newPosition < oldPosition) {
        // Moving up: shift cards between newPosition and oldPosition-1 down
        await this.cardRepository
          .createQueryBuilder()
          .update(Card)
          .set({ position: () => '"position" + 1' })
          .where(
            'column_id = :columnId AND position >= :newPos AND position < :oldPos',
            { columnId: oldColumnId, newPos: newPosition, oldPos: oldPosition },
          )
          .execute();
      }
    } else {
      // Different columns
      // 1. Decrement position for cards in the OLD column with position > oldPosition
      await this.cardRepository
        .createQueryBuilder()
        .update(Card)
        .set({ position: () => '"position" - 1' })
        .where('column_id = :columnId AND position > :oldPos', {
          columnId: oldColumnId,
          oldPos: oldPosition,
        })
        .execute();

      // 2. Increment position for cards in the NEW column with position >= newPosition
      await this.cardRepository
        .createQueryBuilder()
        .update(Card)
        .set({ position: () => '"position" + 1' })
        .where('column_id = :columnId AND position >= :newPos', {
          columnId: newColumnId,
          newPos: newPosition,
        })
        .execute();
    }

    // Update the moved card
    card.columnId = newColumnId;
    card.position = newPosition;
    const savedCard = await this.cardRepository.save(card);

    // Activity log
    await this.activitiesService.create({
      boardId: card.boardId,
      userId,
      action: 'moved',
      entityType: 'card',
      entityId: card.id,
      metadata: JSON.stringify({
        fromColumnId: oldColumnId,
        toColumnId: newColumnId,
        fromPosition: oldPosition,
        toPosition: newPosition,
      }),
    });

    // SSE event
    this.sseService.emit(card.boardId, {
      type: 'card:moved',
      data: savedCard,
    });

    const result = await this.cardRepository.findOne({
      where: { id: savedCard.id },
      relations: { column: true, assignee: true },
    });
    return result as Card;
  }

  async delete(id: number, userId: number): Promise<void> {
    const card = await this.findById(id);

    // Decrement position for cards after this one in the same column
    await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set({ position: () => '"position" - 1' })
      .where('column_id = :columnId AND position > :pos', {
        columnId: card.columnId,
        pos: card.position,
      })
      .execute();

    await this.cardRepository.remove(card);

    // Activity log
    await this.activitiesService.create({
      boardId: card.boardId,
      userId,
      action: 'deleted',
      entityType: 'card',
      entityId: card.id,
      metadata: JSON.stringify({ title: card.title }),
    });

    // SSE event
    this.sseService.emit(card.boardId, {
      type: 'card:deleted',
      data: { id: card.id, boardId: card.boardId },
    });
  }
}
