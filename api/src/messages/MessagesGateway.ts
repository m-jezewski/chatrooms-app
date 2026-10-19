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

@WebSocketGateway(parseInt(process.env.WEBSOCKET_PORT), {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  cookie: true,
})
@UsePipes(new ValidationPipe({ whitelist: true }))
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly messagesService: MessagesService) {}

  afterInit(server: Server) {
    this.logger.log(`WebSocket Gateway initialized on port ${process.env.WEBSOCKET_PORT}`);

    server.on('connection', (socket) => {
      this.logger.log(`Socket ${socket.id} connected`);
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

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(@MessageBody() { channelId }: JoinChannelDto, @ConnectedSocket() client: Socket) {
    const session = await this.reloadSession(client);
    if (!session?.joinedChannels?.includes(channelId)) {
      return client.emit('error', { message: 'Unauthorized', code: NOT_IN_CHANNEL });
    }

    try {
      const { messages, hasMore } = await this.messagesService.getChannelMessagePage({ channelId });
      client.join(`channel_${channelId}`);
      client.emit('joinedChannel', { messages, hasMore, channelId });
    } catch {
      client.emit('error', { message: 'Failed to join the channel' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() { channelId, payload, senderId }: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(`channel_${channelId}`)) {
      return client.emit('error', { message: 'Access denied' });
    }

    try {
      const message = await this.messagesService.createMessage({ channelId, payload, senderId });

      this.server.to(`channel_${channelId}`).emit('newMessage', message);
    } catch {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  closeChannel(channelId: string): void {
    const room = `channel_${channelId}`;

    this.server.to(room).emit('roomClosed', { channelId });
    this.server.in(room).socketsLeave(room);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(@MessageBody() { channelId }: LeaveChannelDto, @ConnectedSocket() client: Socket) {
    client.leave(`channel_${channelId}`);
    client.emit('leftChannel', { message: `Left channel ${channelId}` });
  }
}
