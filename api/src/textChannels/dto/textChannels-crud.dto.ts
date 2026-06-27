import { TextChannel } from '@prisma/client';
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { OmitType, PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TextChannelDto implements TextChannel {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'name', minLength: 3, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiPropertyOptional({ example: 'a1b2c3d4-...', nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId: string | null;

  @ApiProperty({ example: ['a1b2c3d4-...', 'e5f6...'], type: [String] })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('all', { each: true })
  users: string[];
}

export class CreateTextChannelDto extends OmitType(TextChannelDto, ['id', 'createdAt', 'ownerId'] as const) {}

export class UpdateTextChannelDto extends PartialType(CreateTextChannelDto) {}

export class UpdateChannelUsersDto extends OmitType(TextChannelDto, ['name', 'id', 'createdAt', 'ownerId'] as const) {}
