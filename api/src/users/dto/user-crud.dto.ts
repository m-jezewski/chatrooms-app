import { IsDate, IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { OmitType, ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export type UserProfile = Omit<User, 'password'>;

export class UserDto implements User {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'user@email.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password', minLength: 5, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'Jan Kowalski', minLength: 3, maxLength: 75 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(75)
  name: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;
}

export class CreateUserDto extends OmitType(UserDto, ['createdAt', 'id']) {}

export class RegisterUserDto extends OmitType(UserDto, ['createdAt', 'id']) {}

// with password omitted
export class UserEntity implements Omit<User, 'password'> {
  id: string;
  name: string;
  email: string;
  createdAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserProfile>) {
    Object.assign(this, partial);
  }
}
