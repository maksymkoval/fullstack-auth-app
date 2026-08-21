/**
 * DTO (Data Transfer Object) for internal user creation.
 * This is a contract BETWEEN layers (auth.service → users.service),
 * so it already carries a passwordHash, not a raw password.
 */
export class CreateUserDto {
  email: string;
  name: string;
  passwordHash: string;
}
