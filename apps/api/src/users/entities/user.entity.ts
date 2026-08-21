/**
 * The "public" representation of a user — what's safe to hand out.
 * The key difference from the DB model: there's NO passwordHash here.
 *
 * Never return the password hash to the client.
 */
export class UserEntity {
  id: string;
  email: string;
  name: string;
  createdAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
