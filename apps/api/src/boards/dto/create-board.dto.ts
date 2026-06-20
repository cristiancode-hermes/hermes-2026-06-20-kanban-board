import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ example: 'My Board' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Description of my board' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'blue', default: 'blue' })
  @IsString()
  @IsOptional()
  accentColor?: string;
}
