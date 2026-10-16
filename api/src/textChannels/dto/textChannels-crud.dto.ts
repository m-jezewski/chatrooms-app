import { TextChannel } from '@prisma/client';
import {
  IsBase64,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { OmitType, PartialType, PickType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ANONYMOUS_TTL_MAX_MS, TTL_MAX_MS, TTL_MIN_MS } from '../room-expiry';

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

  @ApiProperty({ example: 'base64 salt', description: 'Per-room salt, 16 bytes.', minLength: 24, maxLength: 24 })
  @IsString()
  @IsNotEmpty()
  @Length(24, 24)
  @IsBase64()
  salt: string;

  @ApiProperty({ description: 'bcrypt hash of the room auth key.' })
  @IsString()
  @IsNotEmpty()
  authKeyHash: string;

  @ApiProperty({ example: 'K7QF9M2X', description: 'Public locator token used to share/find the room.' })
  @IsString()
  @IsNotEmpty()
  inviteCode: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'SHA-256 of the anonymous owner token; null for account-owned rooms.',
  })
  @IsOptional()
  @IsString()
  ownerTokenHash: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'When the room self-destructs; null means never.' })
  @IsOptional()
  @IsDate()
  expiresAt: Date | null;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiPropertyOptional({ example: 'a1b2c3d4-...', nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId: string | null;
}

export class CreateTextChannelDto extends OmitType(TextChannelDto, [
  'id',
  'createdAt',
  'ownerId',
  'authKeyHash',
  'inviteCode',
  'ownerTokenHash',
  'expiresAt',
] as const) {
  @ApiProperty({
    example: 'base64(32B)',
    description: 'Client-derived proof of the room password. Hashed server-side, never stored raw.',
    minLength: 44,
    maxLength: 44,
  })
  @IsString()
  @IsNotEmpty()
  @Length(44, 44)
  @IsBase64()
  authKey: string;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: TTL_MIN_MS,
    maximum: TTL_MAX_MS,
    example: 86_400_000,
    description: `Lifetime in milliseconds or null`,
  })
  @IsOptional()
  @IsInt()
  @Min(TTL_MIN_MS)
  @Max(TTL_MAX_MS)
  ttlMs?: number | null;
}

export class UpdateTextChannelDto extends PartialType(
  OmitType(CreateTextChannelDto, ['salt', 'authKey', 'ttlMs'] as const),
) {
  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: TTL_MIN_MS,
    maximum: TTL_MAX_MS,
    example: 86_400_000,
    description: `Lifetime in milliseconds or null`,
  })
  @IsOptional()
  @IsInt()
  @Min(TTL_MIN_MS)
  @Max(TTL_MAX_MS)
  ttlMs?: number | null;
}

export class JoinTextChannelDto extends PickType(CreateTextChannelDto, ['authKey'] as const) {}

export class TextChannelDetailsDto extends OmitType(TextChannelDto, ['authKeyHash', 'ownerTokenHash'] as const) {}

export class CreatedTextChannelDto extends TextChannelDetailsDto {
  @ApiPropertyOptional({
    description: 'Raw owner token, returned exactly once for anonymous creators. Store it client-side.',
  })
  ownerToken?: string;
}

export class RoomEntryDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  roomId: string;

  @ApiProperty({ example: 'name' })
  name: string;

  @ApiProperty({ example: 'base64 salt', description: 'Per-room KDF salt.' })
  salt: string;
}

export class SaveRoomDto {
  @ApiPropertyOptional({ description: 'Optional custom label; falls back to the room name.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}

export class SavedRoomDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  roomId: string;

  @ApiProperty({ example: 'name' })
  name: string;
}
