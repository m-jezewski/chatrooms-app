import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TextChannel, User } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import {
  CreatedTextChannelDto,
  CreateTextChannelDto,
  RoomEntryDto,
  SavedRoomDto,
  TextChannelDetailsDto,
  UpdateTextChannelDto,
} from './dto/textChannels-crud.dto';
import * as bcrypt from 'bcrypt';
import { activeRoomWhere, ANONYMOUS_TTL_MAX_MS } from './room-expiry';
import { MessagesGateway } from '../messages/MessagesGateway';

const AUTH_KEY_SALT_ROUNDS = 10;
const OWNER_TOKEN_BYTES = 32;
const INVITE_CODE_LENGTH = 8;

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_MAX_ATTEMPTS = 5;
const SECRET_FIELDS = { authKeyHash: true, ownerTokenHash: true } as const;
const ENTRY_SELECT = { id: true, name: true, salt: true } as const;

export interface ManageContext {
  user?: User;
  ownerToken?: string;
}

@Injectable()
export class TextChannelsService {
  constructor(
    private prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private canManage(channel: Pick<TextChannel, 'ownerId' | 'ownerTokenHash'>, ctx: ManageContext): boolean {
    const { user, ownerToken } = ctx;

    if (channel.ownerId && user && channel.ownerId === user.id) {
      return true;
    }
    return !!channel.ownerTokenHash && !!ownerToken && this.sha256(ownerToken) === channel.ownerTokenHash;
  }

  private assertCanManage(channel: Pick<TextChannel, 'ownerId' | 'ownerTokenHash'>, ctx: ManageContext): void {
    if (!this.canManage(channel, ctx)) {
      throw new ForbiddenException('Only the room owner can manage this room');
    }
  }

  private generateInviteCode(): string {
    const bytes = randomBytes(INVITE_CODE_LENGTH);
    let code = '';
    for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
      code += INVITE_ALPHABET[bytes[i] % INVITE_ALPHABET.length];
    }
    return code;
  }

  private async generateUniqueInviteCode(): Promise<string> {
    for (let attempt = 0; attempt < INVITE_CODE_MAX_ATTEMPTS; attempt++) {
      const code = this.generateInviteCode();
      const existing = await this.prisma.textChannel.findUnique({ where: { inviteCode: code }, select: { id: true } });
      if (!existing) {
        return code;
      }
    }
    throw new Error('Could not generate a unique invite code');
  }

  private resolveExpiry(ttlMs: number | null | undefined, isAccountOwned: boolean): Date | null {
    if (ttlMs === null || ttlMs === undefined) {
      if (!isAccountOwned) {
        throw new BadRequestException('Anonymous rooms must have an expiry');
      }
      return null;
    }
    if (!isAccountOwned && ttlMs > ANONYMOUS_TTL_MAX_MS) {
      throw new BadRequestException('Anonymous rooms can live at most 30 days');
    }

    return new Date(Date.now() + ttlMs);
  }

  private async getManageableChannel(channelId: string): Promise<TextChannel> {
    const channel = await this.prisma.textChannel.findUnique({ where: activeRoomWhere({ id: channelId }) });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  async getChannel(params: {
    channelId: string;
    joinedChannels: string[];
    ctx: ManageContext;
  }): Promise<TextChannelDetailsDto> {
    const { channelId, joinedChannels, ctx } = params;
    const channel = await this.prisma.textChannel.findUnique({ where: activeRoomWhere({ id: channelId }) });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    if (!joinedChannels.includes(channelId) && !this.canManage(channel, ctx)) {
      throw new ForbiddenException('Room is locked');
    }

    const { authKeyHash: _authKeyHash, ownerTokenHash: _ownerTokenHash, ...details } = channel;
    return details;
  }

  async getRoomEntryById(channelId: string): Promise<RoomEntryDto> {
    return this.getRoomEntry({ id: channelId });
  }

  async getRoomEntryByCode(inviteCode: string): Promise<RoomEntryDto> {
    return this.getRoomEntry({ inviteCode });
  }

  private async getRoomEntry(where: Prisma.TextChannelWhereUniqueInput): Promise<RoomEntryDto> {
    const channel = await this.prisma.textChannel.findUnique({ where: activeRoomWhere(where), select: ENTRY_SELECT });

    if (!channel) {
      throw new NotFoundException('Room not found');
    }

    return { roomId: channel.id, name: channel.name, salt: channel.salt };
  }

  async verifyChannelAuthKey(params: { channelId: string; authKey: string }): Promise<void> {
    const { channelId, authKey } = params;
    const channel = await this.prisma.textChannel.findUnique({ where: activeRoomWhere({ id: channelId }) });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const authKeyMatches = await bcrypt.compare(authKey, channel.authKeyHash);
    if (!authKeyMatches) {
      throw new ForbiddenException('Incorrect room password');
    }
  }

  async createTextChannel(params: { textChannel: CreateTextChannelDto; user?: User }): Promise<CreatedTextChannelDto> {
    const { textChannel, user } = params;
    const { authKey, ttlMs, ...channelData } = textChannel;

    const parsedExpiresAt = this.resolveExpiry(ttlMs, !!user);
    const inviteCode = await this.generateUniqueInviteCode();
    const authKeyHash = await bcrypt.hash(authKey, AUTH_KEY_SALT_ROUNDS);

    if (user) {
      return this.prisma.textChannel.create({
        data: {
          ...channelData,
          authKeyHash,
          inviteCode,
          expiresAt: parsedExpiresAt,
          owner: { connect: { id: user.id } },
        },
        omit: SECRET_FIELDS,
      });
    }

    const ownerToken = randomBytes(OWNER_TOKEN_BYTES).toString('base64url');
    const channel = await this.prisma.textChannel.create({
      data: {
        ...channelData,
        authKeyHash,
        inviteCode,
        expiresAt: parsedExpiresAt,
        ownerTokenHash: this.sha256(ownerToken),
      },
      omit: SECRET_FIELDS,
    });

    return { ...channel, ownerToken };
  }

  async rotateInviteCode(params: { channelId: string; ctx: ManageContext }): Promise<{ inviteCode: string }> {
    const { channelId, ctx } = params;
    const channel = await this.getManageableChannel(channelId);
    this.assertCanManage(channel, ctx);

    const inviteCode = await this.generateUniqueInviteCode();
    await this.prisma.textChannel.update({ where: { id: channelId }, data: { inviteCode } });
    return { inviteCode };
  }

  async updateTextChannel(params: {
    channelId: string;
    ctx: ManageContext;
    textChannel: UpdateTextChannelDto;
  }): Promise<TextChannelDetailsDto> {
    const { textChannel, channelId, ctx } = params;
    const channel = await this.getManageableChannel(channelId);
    this.assertCanManage(channel, ctx);

    const { ttlMs, ...rest } = textChannel;
    const expiry = 'ttlMs' in textChannel ? { expiresAt: this.resolveExpiry(ttlMs, !!channel.ownerId) } : {};

    return this.prisma.textChannel.update({
      where: { id: channelId },
      data: { ...rest, ...expiry },
      omit: SECRET_FIELDS,
    });
  }

  async deleteTextChannel(params: { channelId: string; ctx: ManageContext }): Promise<TextChannelDetailsDto> {
    const { channelId, ctx } = params;
    const channel = await this.getManageableChannel(channelId);
    this.assertCanManage(channel, ctx);

    const deleted = await this.prisma.textChannel.delete({ where: { id: channelId }, omit: SECRET_FIELDS });
    this.messagesGateway.closeChannel(channelId);

    return deleted;
  }

  async rememberRoom(params: { userId: string; roomId: string }): Promise<void> {
    const { userId, roomId } = params;
    await this.prisma.savedRoom.upsert({
      where: { userId_roomId: { userId, roomId } },
      create: { userId, roomId },
      update: {},
    });
  }

  async forgetRoom(params: { userId: string; roomId: string }): Promise<void> {
    const { userId, roomId } = params;
    await this.prisma.savedRoom.deleteMany({ where: { userId, roomId } });
  }

  async getSavedRooms(userId: string): Promise<SavedRoomDto[]> {
    const saved = await this.prisma.savedRoom.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { room: { select: { name: true } } },
    });

    return saved.map((entry) => ({ roomId: entry.roomId, name: entry.name ?? entry.room.name }));
  }
}
