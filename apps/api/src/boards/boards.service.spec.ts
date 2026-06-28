import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { ColumnEntity } from '../columns/column.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BoardsService', () => {
  let service: BoardsService;
  let boardRepository: Partial<Repository<Board>>;
  let columnRepository: Partial<Repository<ColumnEntity>>;

  const mockBoard: Board = {
    id: 1,
    name: 'My Board',
    description: 'A test board',
    accentColor: 'blue',
    userId: 1,
    user: null as any,
    columns: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockColumn: ColumnEntity = {
    id: 1,
    name: 'To Do',
    position: 0,
    maxCards: null,
    boardId: 1,
    board: null as any,
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    boardRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    columnRepository = {
      createQueryBuilder: jest.fn((): any => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      })),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: getRepositoryToken(Board), useValue: boardRepository },
        { provide: getRepositoryToken(ColumnEntity), useValue: columnRepository },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  describe('findAllByUser', () => {
    it('should return all boards for a user with card counts', async () => {
      const boards = [
        { ...mockBoard, id: 1, columns: [mockColumn] },
        { ...mockBoard, id: 2, columns: [mockColumn] },
      ];
      (boardRepository.find as jest.Mock).mockResolvedValue(boards);

      const result = await service.findAllByUser(1);

      expect(boardRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: { columns: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('cardCount');
    });
  });

  describe('create', () => {
    it('should create a board with 3 default columns', async () => {
      (boardRepository.create as jest.Mock).mockReturnValue(mockBoard);
      (boardRepository.save as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockBoard,
        columns: [mockColumn],
      });
      (columnRepository.create as jest.Mock).mockReturnValue(mockColumn);
      (columnRepository.save as jest.Mock).mockResolvedValue([mockColumn]);

      const dto: CreateBoardDto = {
        name: 'My Board',
        description: 'A test board',
        accentColor: 'blue',
      };

      const result = await service.create(dto, 1);

      expect(boardRepository.create).toHaveBeenCalledWith({
        name: 'My Board',
        description: 'A test board',
        accentColor: 'blue',
        userId: 1,
      });
      expect(columnRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should use default accent color if not provided', async () => {
      (boardRepository.create as jest.Mock).mockReturnValue(mockBoard);
      (boardRepository.save as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findOne as jest.Mock).mockResolvedValue(mockBoard);
      (columnRepository.create as jest.Mock).mockReturnValue(mockColumn);
      (columnRepository.save as jest.Mock).mockResolvedValue([mockColumn]);

      await service.create({ name: 'Minimal Board' }, 1);

      expect(boardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ accentColor: 'blue' }),
      );
    });
  });

  describe('findById', () => {
    it('should return a board owned by the user', async () => {
      (boardRepository.findOne as jest.Mock).mockResolvedValue(mockBoard);

      const result = await service.findById(1, 1);

      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        relations: { columns: { cards: { assignee: true } } },
        order: { columns: { position: 'ASC' } },
      });
      expect(result).toEqual(mockBoard);
    });

    it('should throw NotFoundException when board not found', async () => {
      (boardRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when board belongs to another user', async () => {
      (boardRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update board fields', async () => {
      const updatedBoard = { ...mockBoard, name: 'Updated Name' };
      (boardRepository.findOne as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.save as jest.Mock).mockResolvedValue(updatedBoard);

      const dto: UpdateBoardDto = { name: 'Updated Name' };
      const result = await service.update(1, dto, 1);

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when board not found', async () => {
      (boardRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(999, { name: 'Nope' }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a board', async () => {
      (boardRepository.findOne as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.remove as jest.Mock).mockResolvedValue(mockBoard);

      await service.delete(1, 1);

      expect(boardRepository.remove).toHaveBeenCalledWith(mockBoard);
    });

    it('should throw NotFoundException when board not found', async () => {
      (boardRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.delete(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
