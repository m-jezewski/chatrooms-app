import { IsBase64, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
  @ApiProperty({ example: 'base64(IV ‖ ciphertext ‖ authTag)', maxLength: 12000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  @IsBase64()
  payload: string;

  @ApiProperty({ example: 'kQ8f...', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @IsBase64({ urlSafe: true })
  senderId: string;
}
