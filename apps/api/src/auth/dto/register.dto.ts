import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for registration input. class-validator decorators are checked
 * automatically by the global ValidationPipe (see main.ts).
 * Invalid data means the client gets a 400 BEFORE the controller even runs.
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(72) // bcrypt's limit
  password: string;
}
