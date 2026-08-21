import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard — a "gatekeeper" for a route. It decides whether the request
 * gets to proceed at all.
 *
 * This guard simply activates the JwtStrategy ('jwt'). Attach it via
 * @UseGuards(JwtAuthGuard) on a controller or a single method to make
 * that route protected. An invalid token means an automatic 401.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
