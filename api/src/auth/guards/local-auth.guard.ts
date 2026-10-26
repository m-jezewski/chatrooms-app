import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const result = (await super.canActivate(context)) as boolean;
    await this.establishSession(request);
    return result;
  }

  private async establishSession(request: Request): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      request.logIn(request.user, { session: true, keepSessionInfo: true }, (error) =>
        error ? reject(error) : resolve(),
      ),
    );
  }
}
