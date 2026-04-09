import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class FindByIdDto {
  @ApiProperty({
    example: 'b8f7d19c-ecb8-4f45-b9a5-1234567890ab',
    description: 'ID of the related collection',
    required: true,
  })
  @IsString()
  @IsUUID(4)
  @Expose()
  id: string;
}
