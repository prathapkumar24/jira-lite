import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../interfaces/auth-backend.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Invalidate expired access tokens immediately
      secretOrKey:
        process.env.JWT_ACCESS_SECRET || 'access-secret-token-key-dev-64',
    });
  }
  /**
   * Passport core strategy hook. Executes automatically for any request passing through
   * JwtAuthGuard. Validates the user and enforces the active status policy.
   */
  async validate(payload: { sub: JwtPayload['id'] }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException(
        'Access token validation failed: Account missing.',
      );
    }
    // Circuit Breaker Rule: If deactivated, abort the execution chain immediately.
    if (!user.isActive) {
      throw new UnauthorizedException('Your account is currently inactive.');
    }
    // Returns structural state data attached directly to request object as req.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
