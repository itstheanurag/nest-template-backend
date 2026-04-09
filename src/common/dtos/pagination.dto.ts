import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items to return',
    type: Number,
  })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsOptional()
  @IsNumber()
  @Expose()
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of items to skip',
    type: Number,
  })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsOptional()
  @IsNumber()
  @Expose()
  offset?: number;
}
