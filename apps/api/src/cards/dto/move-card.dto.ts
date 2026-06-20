import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveCardDto {
  @ApiProperty()
  @IsNumber()
  columnId: number;

  @ApiProperty()
  @IsNumber()
  position: number;
}
