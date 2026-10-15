import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message } from '@prisma/client';
import { activeRoomWhere } from '../textChannels/room-expiry';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  private async assertRoomIsLive(channelId: string): Promise<void> {
    const room = await this.prisma.textChannel.findUnique({
      where: activeRoomWhere({ id: channelId }),
      select: { id: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }
  }

  async getChannelMessages(params: { channelId: string; before?: string; limit?: number }): Promise<Message[]> {
    const { channelId, before, limit = 20 } = params;
    await this.assertRoomIsLive(channelId);

    const messages = await this.prisma.message.findMany({
      ...(before && { cursor: { id: before }, skip: 1 }),
      where: { textChannelId: channelId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });

    return messages.reverse();
  }

  async createMessage(params: { channelId: string; payload: string; senderId: string }): Promise<Message> {
    const { channelId, payload, senderId } = params;

    return this.prisma.message.create({
      data: {
        payload,
        senderId,
        textChannel: { connect: activeRoomWhere({ id: channelId }) },
      },
    });
  }
}
