import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserEntity } from "../../users/entities/user.entity";

/**
 * Custom parameter decorator. Pulls out the user that JwtStrategy
 * attached to request.user and hands it straight to the controller argument.
 *
 * Instead of:   const user = req.user;
 * We write:     @CurrentUser() user: UserEntity
 *
 * Small thing, but it keeps controllers cleaner and typed.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserEntity;
  },
);
