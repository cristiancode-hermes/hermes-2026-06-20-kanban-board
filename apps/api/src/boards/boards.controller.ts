import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('boards')
@ApiBearerAuth()
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.boardsService.findAllByUser(user.id);
  }

  @Post()
  create(
    @Body() dto: CreateBoardDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.boardsService.create(dto, user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: number },
  ) {
    return this.boardsService.findById(+id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.boardsService.update(+id, dto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: number },
  ) {
    return this.boardsService.delete(+id, user.id);
  }
}
