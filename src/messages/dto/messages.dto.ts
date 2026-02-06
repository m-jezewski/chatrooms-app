import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Message } from '@prisma/client';

export class MessageDto implements Message {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'Hello world!', minLength: 1, maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(5000, { message: 'Message cannot exceed 5000 characters' })
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  authorId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  textChannelId: number;

  @ApiProperty()
  createdAt: Date;
}

// REST DTOs
export class UpdateMessageDto extends PickType(MessageDto, ['content'] as const) {}

export class GetMessagesQueryDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  before?: number;

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
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  channelId: number;
}

export class LeaveChannelDto extends JoinChannelDto {}

export class SendMessageDto extends JoinChannelDto {
  @ApiProperty({ example: 'Hello world!', minLength: 1, maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(5000, { message: 'Message cannot exceed 5000 characters' })
  content: string;
}
