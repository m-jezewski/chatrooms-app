import { NotFoundException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from './messages.service';

describe('MessagesService pagination', () => {
  const findUnique = jest.fn();
  const findMany = jest.fn();
  const prisma = {
    textChannel: { findUnique },
    message: { findMany },
  } as unknown as PrismaService;
  let service: MessagesService;

  const message = (index: number): Message =>
    ({
      id: `message-${index}`,
      payload: `cipher-${index}`,
      senderId: 'sender',
      createdAt: new Date(Date.UTC(2026, 9, 18, 10, index)),
      textChannelId: 'room-1',
    }) as Message;

  const newestFirst = (count: number) => Array.from({ length: count }, (_unused, index) => message(count - index));

  beforeEach(() => {
    jest.clearAllMocks();
    findUnique.mockResolvedValue({ id: 'room-1' });
    service = new MessagesService(prisma);
  });

  const takenLimit = () => findMany.mock.calls[0][0].take;

  it('asks for one message more than the page size', async () => {
    findMany.mockResolvedValue(newestFirst(5));

    await service.getChannelMessagePage({ channelId: 'room-1', limit: 20 });

    expect(takenLimit()).toBe(21);
  });

  it('returns the page oldest first', async () => {
    findMany.mockResolvedValue(newestFirst(3));

    const { messages } = await service.getChannelMessagePage({ channelId: 'room-1', limit: 20 });

    expect(messages.map((entry) => entry.id)).toEqual(['message-1', 'message-2', 'message-3']);
  });

  it('says there is nothing older when the room holds less than a page', async () => {
    findMany.mockResolvedValue(newestFirst(3));

    const { messages, hasMore } = await service.getChannelMessagePage({ channelId: 'room-1', limit: 20 });

    expect(hasMore).toBe(false);
    expect(messages).toHaveLength(3);
  });

  it('says there is more and drops the extra message, keeping the one next to the cursor', async () => {
    findMany.mockResolvedValue(newestFirst(4));

    const { messages, hasMore } = await service.getChannelMessagePage({
      channelId: 'room-1',
      before: 'message-5',
      limit: 3,
    });

    expect(hasMore).toBe(true);
    expect(messages.map((entry) => entry.id)).toEqual(['message-2', 'message-3', 'message-4']);
  });

  it('pages through the whole history without losing a message', async () => {
    const all = newestFirst(7);
    findMany.mockImplementation(({ cursor, skip = 0, take }) => {
      const from = cursor ? all.findIndex((entry) => entry.id === cursor.id) + skip : 0;
      return Promise.resolve(all.slice(from, from + take));
    });

    const first = await service.getChannelMessagePage({ channelId: 'room-1', limit: 3 });
    const second = await service.getChannelMessagePage({
      channelId: 'room-1',
      before: first.messages[0].id,
      limit: 3,
    });
    const third = await service.getChannelMessagePage({
      channelId: 'room-1',
      before: second.messages[0].id,
      limit: 3,
    });

    expect([...third.messages, ...second.messages, ...first.messages].map((entry) => entry.id)).toEqual([
      'message-1',
      'message-2',
      'message-3',
      'message-4',
      'message-5',
      'message-6',
      'message-7',
    ]);
    expect(third.hasMore).toBe(false);
  });

  it('refuses to hand out the history of a room that is gone', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.getChannelMessagePage({ channelId: 'room-1' })).rejects.toThrow(NotFoundException);
    expect(findMany).not.toHaveBeenCalled();
  });
});
