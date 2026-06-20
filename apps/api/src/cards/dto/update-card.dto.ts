import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

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
