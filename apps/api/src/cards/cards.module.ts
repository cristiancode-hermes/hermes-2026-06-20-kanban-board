import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card } from './card.entity';
import { ColumnEntity } from '../columns/column.entity';
import { Board } from '../boards/board.entity';
import { ActivitiesModule } from '../activities/activities.module';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, ColumnEntity, Board]),
    ActivitiesModule,
    SseModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
