import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { ColumnEntity } from '../columns/column.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(ColumnEntity)
    private columnRepository: Repository<ColumnEntity>,
  ) {}

  async findAllByUser(userId: number): Promise<Board[]> {
    const boards = await this.boardRepository.find({
      where: { userId },
      relations: { columns: true },
      order: { createdAt: 'DESC' },
    });

    // Add cardCount to each board
    return Promise.all(
      boards.map(async (board) => {
        const cardCount = await this.columnRepository
          .createQueryBuilder('col')
          .leftJoinAndSelect('col.cards', 'card')
          .where('col.board_id = :boardId', { boardId: board.id })
          .getCount();
        return {
          ...board,
          cardCount,
        } as Board & { cardCount: number };
      }),
    );
  }

  async create(dto: CreateBoardDto, userId: number): Promise<Board> {
    const board = this.boardRepository.create({
      name: dto.name,
      description: dto.description || '',
      accentColor: dto.accentColor || 'blue',
      userId,
    });
    const savedBoard = await this.boardRepository.save(board);

    // Create 3 default columns
    const defaultColumns = [
      { name: 'To Do', position: 0, boardId: savedBoard.id },
      { name: 'In Progress', position: 1, boardId: savedBoard.id },
      { name: 'Done', position: 2, boardId: savedBoard.id },
    ];

    await this.columnRepository.save(
      defaultColumns.map((c) => this.columnRepository.create(c)),
    );

    return this.boardRepository.findOne({
      where: { id: savedBoard.id },
      relations: { columns: true },
    }) as Promise<Board>;
  }

  async findById(id: number, userId: number): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id, userId },
      relations: { columns: { cards: { assignee: true } } },
      order: { columns: { position: 'ASC' } },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async update(id: number, dto: UpdateBoardDto, userId: number): Promise<Board> {
    const board = await this.findById(id, userId);
    Object.assign(board, dto);
    return this.boardRepository.save(board);
  }

  async delete(id: number, userId: number): Promise<void> {
    const board = await this.findById(id, userId);
    await this.boardRepository.remove(board);
  }
}
