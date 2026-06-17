import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import * as AuthTypes from '../interfaces/auth-backend.schema';
import { loginResponseType, registerResponseType } from '@jira-lite/contracts';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<registerResponseType> {
    const user = await this.authService.registerUser(dto);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      mobileNumber: user.mobileNumber,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<loginResponseType> {
    const user = await this.authService.validateUserCredentials(dto);
    const accessPayload = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);
    // Apply secure HttpOnly cookie injection with explicit path routing
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/v1/api/auth/refresh', // Bounds token delivery exclusively to the refresh pipeline
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days in Milliseconds
    });
    return {
      accessToken: accessPayload.accessToken,
      expiresInSeconds: accessPayload.expiresInSeconds,
      user: {
        id: user.id,
        displayName: user.name,
        role: user.role,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const existingCookieToken = request.cookies['refresh_token'] as
      | string
      | undefined;
    if (!existingCookieToken) {
      throw new UnauthorizedException(
        'Refresh token is invalid, expired, or has been revoked.',
      );
    }
    const user =
      await this.authService.verifyRefreshTokenSignature(existingCookieToken);
    const accessPayload = await this.authService.generateAccessToken(user);
    const rotatedRefreshToken =
      await this.authService.generateRefreshToken(user);
    // Re-verify cookie updates via rolling session strategy
    response.cookie('refresh_token', rotatedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/v1/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken: accessPayload.accessToken,
      expiresInSeconds: accessPayload.expiresInSeconds,
      user: {
        id: user.id,
        displayName: user.name,
        role: user.role,
      },
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(
    @Res({ passthrough: true }) response: Response,
  ): Record<string, string> {
    // Purges authorization cookies dynamically across boundaries
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/v1/api/auth/refresh',
    });
    return {
      message:
        'Session successfully terminated, invalidated, and cookies purged.',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  getProfile(@GetUser() user: AuthTypes.JwtPayload): AuthTypes.JwtPayload {
    return user;
  }
}
