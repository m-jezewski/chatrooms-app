import { ConflictException } from '@nestjs/common';

export class EmailInUseError extends ConflictException {
  constructor(message = 'User with provided email already exists') {
    super(message);
  }
}

export class ChannelWithProvidedNameExistError extends ConflictException {
  constructor(message = 'Channel with provided name already exists') {
    super(message);
  }
}
