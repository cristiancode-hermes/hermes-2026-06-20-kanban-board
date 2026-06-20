import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto, UpdateColumnPositionDto } from './dto/update-column.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('columns')
@ApiBearerAuth()
@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Post()
  create(@Body() dto: CreateColumnDto) {
    return this.columnsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.update(+id, dto);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdateColumnPositionDto,
  ) {
    return this.columnsService.updatePosition(+id, dto.position);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columnsService.delete(+id);
  }
}
