import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import {
  CreateTextChannelDto,
  TextChannelPublicDto,
  TextChannelWithUsersDto,
  UpdateTextChannelDto,
} from './dto/textChannels-crud.dto';
import * as bcrypt from 'bcrypt';

const AUTH_KEY_SALT_ROUNDS = 10;

@Injectable()
export class TextChannelsService {
  constructor(private prisma: PrismaService) {}

  private canAccessChannel(channel: TextChannelWithUsersDto, user: User): boolean {
    return channel.users.some((channelUser) => channelUser.id === user.id);
  }

  private assertChannelOwner(channel: TextChannelWithUsersDto, user: User): void {
    if (channel.ownerId !== user.id) {
      throw new ForbiddenException('Only the channel owner can perform this action');
    }
  }

  async findChannelsByUser(params: {
    findParams: Prisma.TextChannelFindManyArgs;
    user: User;
  }): Promise<TextChannelPublicDto[]> {
    const { findParams, user } = params;

    return this.prisma.textChannel.findMany({
      ...findParams,
      where: {
        ...findParams.where,
        users: {
          some: {
            id: user.id,
          },
        },
      },
      omit: { authKeyHash: true },
    });
  }

  async getChannel(params: { channelId: string; user: User }): Promise<TextChannelWithUsersDto> {
    const { channelId, user } = params;
    const channel = await this.prisma.textChannel.findUnique({
      where: { id: channelId },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
      omit: { authKeyHash: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (!this.canAccessChannel(channel, user)) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return channel;
  }

  async verifyChannelAuthKey(params: { channelId: string; authKey: string }): Promise<void> {
    const { channelId, authKey } = params;
    const channel = await this.prisma.textChannel.findUnique({ where: { id: channelId } });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const authKeyMatches = await bcrypt.compare(authKey, channel.authKeyHash);
    if (!authKeyMatches) {
      throw new ForbiddenException('Incorrect room password');
    }
  }

  async createTextChannel(params: { textChannel: CreateTextChannelDto; user: User }): Promise<TextChannelPublicDto> {
    const { textChannel, user } = params;
    const { authKey, users, ...channelData } = textChannel;
    const memberIds = Array.from(new Set([...users, user.id]));

    return this.prisma.textChannel.create({
      data: {
        ...channelData,
        authKeyHash: await bcrypt.hash(authKey, AUTH_KEY_SALT_ROUNDS),
        owner: { connect: { id: user.id } },
        users: {
          connect: memberIds.map((userId) => ({ id: userId })),
        },
      },
      omit: { authKeyHash: true },
    });
  }

  async updateTextChannel(params: {
    channelId: string;
    user: User;
    textChannel: UpdateTextChannelDto;
  }): Promise<TextChannelPublicDto> {
    const { textChannel, channelId, user } = params;
    const channel = await this.getChannel({ channelId, user });
    this.assertChannelOwner(channel, user);

    return this.prisma.textChannel.update({
      where: { id: channelId },
      data: {
        ...textChannel,
        users: textChannel.users ? { set: textChannel.users.map((userId) => ({ id: userId })) } : undefined,
      },
      omit: { authKeyHash: true },
    });
  }

  async deleteTextChannel(params: { channelId: string; user: User }): Promise<TextChannelPublicDto> {
    const { channelId, user } = params;
    const channel = await this.getChannel({ channelId, user });
    this.assertChannelOwner(channel, user);
    return this.prisma.textChannel.delete({ where: { id: channelId }, omit: { authKeyHash: true } });
  }

  async updateUsersInChannel(params: { userIds: string[]; channelId: string; user: User }) {
    const { userIds, channelId, user } = params;
    const channel = await this.getChannel({ channelId, user });
    this.assertChannelOwner(channel, user);

    await this.prisma.textChannel.update({
      where: { id: channelId },
      data: {
        users: {
          connect: userIds.map((userId) => ({ id: userId })),
        },
      },
    });
  }
}