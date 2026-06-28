import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CardsService } from './cards.service';
import { Card } from './card.entity';
import { ColumnEntity } from '../columns/column.entity';
import { Board } from '../boards/board.entity';
import { ActivitiesService } from '../activities/activities.service';
import { SseService } from '../sse/sse.service';
import { NotFoundException } from '@nestjs/common';

describe('CardsService', () => {
  let service: CardsService;
  let cardRepository: Partial<Repository<Card>>;
  let columnRepository: Partial<Repository<ColumnEntity>>;
  let boardRepository: Partial<Repository<Board>>;
  let activitiesService: Partial<ActivitiesService>;
  let sseService: Partial<SseService>;

  const mockCard: Card = {
    id: 1,
    title: 'Test Card',
    description: 'Description',
    position: 0,
    dueDate: null,
    labels: null,
    columnId: 1,
    column: null as any,
    boardId: 1,
    board: null as any,
    assigneeId: null,
    assignee: null as any,
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
    cardRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    columnRepository = {
      findOne: jest.fn(),
    };

    boardRepository = {};

    activitiesService = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    sseService = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: cardRepository },
        { provide: getRepositoryToken(ColumnEntity), useValue: columnRepository },
        { provide: getRepositoryToken(Board), useValue: boardRepository },
        { provide: ActivitiesService, useValue: activitiesService },
        { provide: SseService, useValue: sseService },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  describe('findByBoard', () => {
    it('should return cards for a board ordered by position', async () => {
      const cards = [mockCard];
      (cardRepository.find as jest.Mock).mockResolvedValue(cards);

      const result = await service.findByBoard(1);

      expect(cardRepository.find).toHaveBeenCalledWith({
        where: { boardId: 1 },
        relations: { column: true, assignee: true },
        order: { position: 'ASC' },
      });
      expect(result).toEqual(cards);
    });
  });

  describe('findById', () => {
    it('should return a card by id', async () => {
      (cardRepository.findOne as jest.Mock).mockResolvedValue(mockCard);

      const result = await service.findById(1);

      expect(cardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { column: true, assignee: true, board: true },
      });
      expect(result).toEqual(mockCard);
    });

    it('should throw NotFoundException when card not found', async () => {
      (cardRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a card with auto-assigned position', async () => {
      (columnRepository.findOne as jest.Mock).mockResolvedValue(mockColumn);
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
      };
      (cardRepository.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilderMock);
      (cardRepository.create as jest.Mock).mockReturnValue(mockCard);
      (cardRepository.save as jest.Mock).mockResolvedValue(mockCard);
      (cardRepository.findOne as jest.Mock).mockResolvedValue(mockCard);

      const result = await service.create(
        {
          columnId: 1,
          title: 'New Card',
          description: 'Desc',
          labels: ['bug', 'urgent'],
        },
        1,
      );

      expect(columnRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(cardRepository.create).toHaveBeenCalled();
      expect(activitiesService.create).toHaveBeenCalled();
      expect(sseService.emit).toHaveBeenCalledWith(1, {
        type: 'card:created',
        data: mockCard,
      });
      expect(result).toEqual(mockCard);
    });

    it('should throw NotFoundException when column does not exist', async () => {
      (columnRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create({ columnId: 999, title: 'Card' }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update card fields', async () => {
      const existingCard = {
        ...mockCard,
        title: 'Old Title',
        description: 'Old Desc',
      } as Card;
      const savedCard = {
        ...mockCard,
        title: 'New Title',
        labels: '["bug"]',
      } as Card;

      jest.spyOn(service, 'findById').mockResolvedValue(existingCard);
      (cardRepository.save as jest.Mock).mockResolvedValue(savedCard);
      (cardRepository.findOne as jest.Mock).mockResolvedValue(savedCard);

      const result = await service.update(
        1,
        { title: 'New Title', labels: ['bug'] },
        1,
      );

      expect(cardRepository.save).toHaveBeenCalled();
      expect(activitiesService.create).toHaveBeenCalled();
      expect(sseService.emit).toHaveBeenCalledWith(1, {
        type: 'card:updated',
        data: savedCard,
      });
    });
  });

  describe('moveCard', () => {
    it('should move a card within the same column (moving down)', async () => {
      const existingCard = { ...mockCard, position: 0, columnId: 1 } as Card;
      jest.spyOn(service, 'findById').mockResolvedValue(existingCard);

      const updateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
      (cardRepository.createQueryBuilder as jest.Mock).mockReturnValue(updateQueryBuilder);
      (cardRepository.save as jest.Mock).mockResolvedValue({
        ...existingCard,
        position: 2,
      });
      (cardRepository.findOne as jest.Mock).mockResolvedValue({
        ...existingCard,
        position: 2,
      });

      const result = await service.moveCard(1, { columnId: 1, position: 2 }, 1);

      expect(activitiesService.create).toHaveBeenCalled();
      expect(sseService.emit).toHaveBeenCalled();
      expect(result.position).toBe(2);
    });

    it('should move a card to a different column', async () => {
      const existingCard = { ...mockCard, position: 1, columnId: 1 } as Card;
      jest.spyOn(service, 'findById').mockResolvedValue(existingCard);

      const updateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
      (cardRepository.createQueryBuilder as jest.Mock).mockReturnValue(updateQueryBuilder);
      (cardRepository.save as jest.Mock).mockResolvedValue({
        ...existingCard,
        columnId: 2,
        position: 0,
      });
      (cardRepository.findOne as jest.Mock).mockResolvedValue({
        ...existingCard,
        columnId: 2,
        position: 0,
      });

      const result = await service.moveCard(1, { columnId: 2, position: 0 }, 1);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(result.columnId).toBe(2);
      expect(result.position).toBe(0);
    });

    it('should move a card within the same column (moving up)', async () => {
      const existingCard = { ...mockCard, position: 2, columnId: 1 } as Card;
      jest.spyOn(service, 'findById').mockResolvedValue(existingCard);

      const updateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
      (cardRepository.createQueryBuilder as jest.Mock).mockReturnValue(updateQueryBuilder);
      (cardRepository.save as jest.Mock).mockResolvedValue({
        ...existingCard,
        position: 0,
      });
      (cardRepository.findOne as jest.Mock).mockResolvedValue({
        ...existingCard,
        position: 0,
      });

      const result = await service.moveCard(1, { columnId: 1, position: 0 }, 1);

      expect(activitiesService.create).toHaveBeenCalled();
      expect(result.position).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete a card and reorder remaining ones', async () => {
      const existingCard = { ...mockCard, position: 1, columnId: 1 } as Card;
      jest.spyOn(service, 'findById').mockResolvedValue(existingCard);

      const updateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
      (cardRepository.createQueryBuilder as jest.Mock).mockReturnValue(updateQueryBuilder);
      (cardRepository.remove as jest.Mock).mockResolvedValue(existingCard);

      await service.delete(1, 1);

      expect(cardRepository.createQueryBuilder).toHaveBeenCalled();
      expect(cardRepository.remove).toHaveBeenCalledWith(existingCard);
      expect(activitiesService.create).toHaveBeenCalled();
      expect(sseService.emit).toHaveBeenCalled();
    });
  });
});
