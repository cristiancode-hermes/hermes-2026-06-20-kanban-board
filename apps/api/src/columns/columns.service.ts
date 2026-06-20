import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from './column.entity';
import { Card } from '../cards/card.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async create(dto: CreateColumnDto): Promise<ColumnEntity> {
    // If position not provided, place at the end
    if (dto.position === undefined) {
      const maxPosition = await this.columnRepository
        .createQueryBuilder('col')
        .where('col.board_id = :boardId', { boardId: dto.boardId })
        .select('MAX(col.position)', 'max')
        .getRawOne();
      dto.position = (maxPosition?.max ?? -1) + 1;
    } else {
      // Shift existing columns at this position forward
      await this.columnRepository
        .createQueryBuilder()
        .update(ColumnEntity)
        .set({ position: () => '"position" + 1' })
        .where('board_id = :boardId AND position >= :position', {
          boardId: dto.boardId,
          position: dto.position,
        })
        .execute();
    }

    const column = this.columnRepository.create({
      name: dto.name,
      position: dto.position,
      boardId: dto.boardId,
    });
    return this.columnRepository.save(column);
  }

  async update(id: number, dto: UpdateColumnDto): Promise<ColumnEntity> {
    const column = await this.columnRepository.findOne({ where: { id } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    if (dto.name !== undefined) {
      column.name = dto.name;
    }
    if (dto.maxCards !== undefined) {
      column.maxCards = dto.maxCards;
    }
    return this.columnRepository.save(column);
  }

  async updatePosition(id: number, position: number): Promise<ColumnEntity> {
    const column = await this.columnRepository.findOne({ where: { id } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const oldPosition = column.position;
    if (oldPosition === position) {
      return column;
    }

    // Shift other columns
    if (position < oldPosition) {
      // Moving up: shift columns between new position and old position down
      await this.columnRepository
        .createQueryBuilder()
        .update(ColumnEntity)
        .set({ position: () => '"position" + 1' })
        .where(
          'board_id = :boardId AND position >= :newPos AND position < :oldPos',
          {
            boardId: column.boardId,
            newPos: position,
            oldPos: oldPosition,
          },
        )
        .execute();
    } else {
      // Moving down: shift columns between old position and new position up
      await this.columnRepository
        .createQueryBuilder()
        .update(ColumnEntity)
        .set({ position: () => '"position" - 1' })
        .where(
          'board_id = :boardId AND position > :oldPos AND position <= :newPos',
          {
            boardId: column.boardId,
            oldPos: oldPosition,
            newPos: position,
          },
        )
        .execute();
    }

    column.position = position;
    return this.columnRepository.save(column);
  }

  async delete(id: number): Promise<void> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: { board: { columns: true } },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    // Find the first column in the board (not the one being deleted)
    const firstColumn = column.board.columns
      .filter((c) => c.id !== id)
      .sort((a, b) => a.position - b.position)[0];

    if (!firstColumn) {
      // No other columns, just delete cards and column
      await this.cardRepository.delete({ columnId: id });
    } else {
      // Move cards to first column
      await this.cardRepository
        .createQueryBuilder()
        .update(Card)
        .set({ columnId: firstColumn.id })
        .where('column_id = :columnId', { columnId: id })
        .execute();
    }

    await this.columnRepository.remove(column);
  }
}
