import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('cards')
@ApiBearerAuth()
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get()
  findAll(@Query('boardId') boardId: string) {
    return this.cardsService.findByBoard(+boardId);
  }

  @Post()
  create(
    @Body() dto: CreateCardDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.cardsService.create(dto, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.cardsService.update(+id, dto, user.id);
  }

  @Patch(':id/position')
  moveCard(
    @Param('id') id: string,
    @Body() dto: MoveCardDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.cardsService.moveCard(+id, dto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: number },
  ) {
    return this.cardsService.delete(+id, user.id);
  }
}
