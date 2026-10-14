import { TextChannel } from '@prisma/client';
import { IsDate, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
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
  })
  @IsString()
  @IsNotEmpty()
  authKey: string;

  @ApiPropertyOptional({
    description: 'ISO date when the room should expire. Required (and capped at +30 days) for anonymous creators.',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateTextChannelDto extends PartialType(
  OmitType(CreateTextChannelDto, ['salt', 'authKey', 'expiresAt'] as const),
) {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'New expiry as an ISO date, or null for never. Anonymous-owned rooms must keep an expiry, capped at +30 days.',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
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
