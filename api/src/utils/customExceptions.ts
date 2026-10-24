import { ConflictException } from '@nestjs/common';

export class EmailInUseError extends ConflictException {
  constructor(message = 'User with provided email already exists') {
    super(message);
  }
}
