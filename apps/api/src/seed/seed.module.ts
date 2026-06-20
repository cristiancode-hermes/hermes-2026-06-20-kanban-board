import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Board } from '../boards/board.entity';
import { ColumnEntity } from '../columns/column.entity';
import { Card } from '../cards/card.entity';
import { Activity } from '../activities/activity.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Board, ColumnEntity, Card, Activity]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
