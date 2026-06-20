import { Controller, Get, Query, Param } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get()
  findAll(
    @Query('boardId') boardId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.activitiesService.findByBoard(
      +boardId,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
  }
}
