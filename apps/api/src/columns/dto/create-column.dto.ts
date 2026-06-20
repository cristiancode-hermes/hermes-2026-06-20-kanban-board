import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty()
  @IsNumber()
  boardId: number;

  @ApiProperty({ example: 'To Do' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  position?: number;
}
