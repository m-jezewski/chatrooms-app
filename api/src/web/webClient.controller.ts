import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { CLIENT_ROUTES, WEB_CLIENT_INDEX } from './webClient';

@Controller()
export class WebClientController {
  @Get(CLIENT_ROUTES)
  index(@Res() res: Response): void {
    res.sendFile(WEB_CLIENT_INDEX, (error) => {
      if (error) {
        res.status(HttpStatus.NOT_FOUND).end();
      }
    });
  }
}
