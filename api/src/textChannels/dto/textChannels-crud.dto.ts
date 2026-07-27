import { TextChannel } from '@prisma/client';
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { OmitType, PartialType, PickType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'base64 salt', description: 'Per-room salt' })
  @IsString()
  @IsNotEmpty()
  salt: string;

  @ApiProperty({ description: 'bcrypt hash of the room auth key.' })
  @IsString()
  @IsNotEmpty()
  authKeyHash: string;

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

export class CreateTextChannelDto extends OmitType(TextChannelDto, ['id', 'createdAt', 'ownerId', 'authKeyHash'] as const) {
  @ApiProperty({ example: 'base64(32B)', description: 'Client-derived proof of the room password. Hashed server-side, never stored raw.' })
  @IsString()
  @IsNotEmpty()
  authKey: string;
}

export class UpdateTextChannelDto extends PartialType(OmitType(CreateTextChannelDto, ['salt', 'authKey'] as const)) {
}

export class JoinTextChannelDto extends PickType(CreateTextChannelDto, ['authKey'] as const) {
}

export class UpdateChannelUsersDto extends PickType(TextChannelDto, ['users'] as const) {
}

export class TextChannelPublicDto extends OmitType(TextChannelDto, ['authKeyHash', 'users'] as const) {
}

export class ChannelMemberDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  id: string;
}

export class TextChannelWithUsersDto extends TextChannelPublicDto {
  @ApiProperty({ type: [ChannelMemberDto] })
  users: ChannelMemberDto[];
}