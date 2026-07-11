import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Message } from '@prisma/client';

export class MessageDto implements Message {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'base64 value', description: 'Client-side encrypted message blob.' })
  @IsString()
  @IsNotEmpty()
  payload: string;

  @ApiProperty({ example: '...', description: 'Per-session sender token.' })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  @IsNotEmpty()
  textChannelId: string;

  @ApiProperty()
  createdAt: Date;
}

// REST DTOs
export class GetMessagesQueryDto {
  @ApiPropertyOptional({ example: 'a1b2c3d4-...' })
  @IsOptional()
  @IsUUID()
  before?: string;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// WebSocket DTOs
export class JoinChannelDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  @IsNotEmpty()
  channelId: string;
}

export class LeaveChannelDto extends JoinChannelDto {}

export class SendMessageDto extends JoinChannelDto {
  @ApiProperty({ example: 'base64(IV ‖ ciphertext ‖ authTag)' })
  @IsString()
  @IsNotEmpty()
  payload: string;

  @ApiProperty({ example: 'kQ8f...' })
  @IsString()
  @IsNotEmpty()
  senderId: string;
}
