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
import { WsSessionGuard } from '../auth/guards/ws-session-guard';
import { ForbiddenException, Logger, NotFoundException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SessionData } from 'express-session';
import { CurrentWsUser } from './current-ws-user.decorator';
import { UsersService } from '../users/users.service';
import { TextChannelsService } from '../textChannels/textChannels.service';
import { JoinChannelDto, LeaveChannelDto, SendMessageDto } from './dto/messages.dto';

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

  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly textChannelsService: TextChannelsService,
  ) {}

  async afterInit(server: Server) {
    this.logger.log(`WebSocket Gateway initialized on port ${process.env.WEBSOCKET_PORT}`);

    server.on('connection', (socket) => {
      const handshake = socket?.handshake as any;
      const session = handshake.session;

      if (!session?.passport?.user) {
        this.logger.warn('Unauthorized WebSocket connection attempt');
        socket.disconnect(true);
        return;
      }
      this.logger.log(`User ${session.passport.user} connected`);
    });

    server.on('connect_error', (err) => {
      this.logger.error(`WebSocket connection error: ${err.message}`);
    });
  }

  private reloadSession(client: Socket): Promise<SessionData | undefined> {
    const session = (client.handshake as any)?.session;
    if (!session) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
      session.reload((error: unknown) => resolve(error ? undefined : session));
    });
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() { channelId }: JoinChannelDto,
    @ConnectedSocket() client: Socket,
    @CurrentWsUser() userId: string,
  ) {
    this.logger.log(`User ${userId} is joining channel ${channelId}`);

    try {
      const user = await this.usersService.getUser({ userId });
      await this.textChannelsService.getChannel({ channelId, user });

      const session = await this.reloadSession(client);
      if (!session?.joinedChannels?.includes(channelId)) {
        return client.emit('error', { message: 'Unauthorized' });
      }

      const recentMessages = await this.messagesService.getChannelMessages({ channelId });

      client.join(`channel_${channelId}`);
      client.emit('joinedChannel', { messages: recentMessages, channelId });
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Channel ${channelId} not found`);
        return client.emit('error', { message: 'Channel not found' });
      }
      if (error instanceof ForbiddenException) {
        return client.emit('error', { message: 'You are not a member of this channel' });
      }
      throw error;
    }
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() { channelId, payload, senderId }: SendMessageDto,
    @ConnectedSocket() client: Socket,
    @CurrentWsUser() userId: string,
  ) {
    this.logger.log(`User ${userId} sending message to channel ${channelId}`);

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

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(
    @MessageBody() { channelId }: LeaveChannelDto,
    @ConnectedSocket() client: Socket,
    @CurrentWsUser() userId: string,
  ) {
    this.logger.log(`User ${userId} leaving channel ${channelId}`);
    client.leave(`channel_${channelId}`);
    client.emit('leftChannel', { message: `Left channel ${channelId}` });
  }
}
