import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SanitizeUserInterceptor } from '../common/interceptors/sanitize-user.interceptor';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}), // Handled dynamically during token signature assignment loops within the core service
  ],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizeUserInterceptor, // Automatically applies user record scrubbing strategies across all route boundaries
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
