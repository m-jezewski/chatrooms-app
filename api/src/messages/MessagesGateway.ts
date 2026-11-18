import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { SessionData } from 'express-session';
import { JoinChannelDto, LeaveChannelDto, SendMessageDto } from './dto/messages.dto';

export const NOT_IN_CHANNEL = 'NOT_IN_CHANNEL';

const CHANNEL_PREFIX = 'channel_';

@WebSocketGateway({ cookie: true })
@UsePipes(new ValidationPipe({ whitelist: true }))
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly messagesService: MessagesService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket gateway attached to the main HTTP server');

    server.on('connection', (socket) => {
      this.logger.log(`Socket ${socket.id} connected`);

      socket.on('disconnecting', () => {
        for (const room of socket.rooms) {
          if (!room.startsWith(CHANNEL_PREFIX)) continue;

          this.emitPresence(room.slice(CHANNEL_PREFIX.length), socket.id).catch(() =>
            this.logger.error(`Failed to update presence for ${room}`),
          );
        }
      });
    });

    server.on('connect_error', (err) => {
      this.logger.error(`WebSocket connection error: ${err.message}`);
    });
  }

  private reloadSession(client: Socket): Promise<SessionData | undefined> {
    const handshake = client.handshake as any;
    const session = handshake?.session;
    if (!session) {
      return Promise.resolve(undefined);
    }

    return new Promise((resolve) => {
      session.reload((error: unknown) => resolve(error ? undefined : handshake.session));
    });
  }

  private async emitPresence(channelId: string, exceptSocketId?: string): Promise<void> {
    const room = `${CHANNEL_PREFIX}${channelId}`;
    const sockets = await this.server.in(room).fetchSockets();
    const sessions = new Set(
      sockets.filter((socket) => socket.id !== exceptSocketId).map((socket) => socket.data.sessionId ?? socket.id),
    );

    this.server.to(room).emit('presence', { channelId, count: sessions.size });
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(@MessageBody() { channelId }: JoinChannelDto, @ConnectedSocket() client: Socket) {
    const session = await this.reloadSession(client);
    if (!session?.joinedChannels?.includes(channelId)) {
      return client.emit('error', { message: 'Unauthorized', code: NOT_IN_CHANNEL });
    }

    try {
      const { messages, hasMore } = await this.messagesService.getChannelMessagePage({ channelId });
      client.data.sessionId = (client.handshake as any).sessionID;
      client.join(`${CHANNEL_PREFIX}${channelId}`);
      client.emit('joinedChannel', { messages, hasMore, channelId });
    } catch {
      client.emit('error', { message: 'Failed to join the channel' });
      return;
    }

    await this.emitPresence(channelId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() { channelId, payload, senderId }: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(`${CHANNEL_PREFIX}${channelId}`)) {
      return client.emit('error', { message: 'Access denied' });
    }

    try {
      const message = await this.messagesService.createMessage({ channelId, payload, senderId });

      this.server.to(`${CHANNEL_PREFIX}${channelId}`).emit('newMessage', message);
    } catch {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  closeChannel(channelId: string): void {
    const room = `${CHANNEL_PREFIX}${channelId}`;

    this.server.to(room).emit('roomClosed', { channelId });
    this.server.in(room).socketsLeave(room);
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(@MessageBody() { channelId }: LeaveChannelDto, @ConnectedSocket() client: Socket) {
    client.leave(`${CHANNEL_PREFIX}${channelId}`);
    client.emit('leftChannel', { message: `Left channel ${channelId}` });

    await this.emitPresence(channelId);
  }
}
