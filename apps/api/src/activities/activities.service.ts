import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(data: {
    boardId: number;
    userId: number;
    action: string;
    entityType: string;
    entityId: number;
    metadata?: string;
  }): Promise<Activity> {
    const activity = this.activityRepository.create(data);
    return this.activityRepository.save(activity);
  }

  async findByBoard(
    boardId: number,
    limit = 50,
    offset = 0,
  ): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { boardId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
