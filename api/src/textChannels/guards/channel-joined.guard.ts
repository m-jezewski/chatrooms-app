import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ChannelJoinedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const param = request.params.channelId ?? request.params.id;
    const channelId = typeof param === 'string' ? param : undefined;

    if (!channelId || !request.session?.joinedChannels?.includes(channelId)) {
      throw new ForbiddenException('Room is locked');
    }
    return true;
  }
}
