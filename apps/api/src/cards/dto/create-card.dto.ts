import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty()
  @IsNumber()
  columnId: number;

  @ApiProperty({ example: 'Task title' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  labels?: string[];
}
