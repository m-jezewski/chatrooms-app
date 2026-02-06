import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, User } from '@prisma/client';

export type MessageWithAuthor = Message & {
  author: { name: string };
};

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getMessage(params: { messageId: number }): Promise<Message> {
    const { messageId } = params;
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async getChannelMessages(params: {
    channelId: number;
    before?: number;
    limit?: number;
  }): Promise<MessageWithAuthor[]> {
    const { channelId, before, limit = 20 } = params;

    const messages = await this.prisma.message.findMany({
      where: {
        textChannelId: channelId,
        ...(before && { id: { lt: before } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    return messages;
  }

  async createMessage(params: { channelId: number; userId: number; content: string }): Promise<MessageWithAuthor> {
    const { channelId, userId, content } = params;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const message = await this.prisma.message.create({
      data: {
        content,
        authorId: userId,
        textChannelId: channelId,
      },
    });

    return { ...message, author: { name: user?.name ?? '' } };
  }

  async updateMessage(params: { messageId: number; user: User; content: string }): Promise<Message> {
    const { messageId, user, content } = params;
    const message = await this.getMessage({ messageId });

    if (user.role !== 'ADMIN' && message.authorId !== user.id) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { content },
    });
  }

  async deleteMessage(params: { messageId: number; user: User }): Promise<Message> {
    const { messageId, user } = params;
    const message = await this.getMessage({ messageId });

    if (user.role !== 'ADMIN' && message.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({ where: { id: messageId } });
  }
}
