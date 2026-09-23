import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { JwtPayload } from '../interfaces/auth-backend.schema';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  /**
   * Registers a user account with active validation rules.
   */
  async registerUser(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException(
        `The email address '${dto.email}' is already registered.`,
      );
    }

    // Enforce Argon2id security settings
    const passwordHash = await argon2.hash(dto.passwordHash, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB processing RAM allocation
      timeCost: 3, // Iteration count
      parallelism: 4, // Multithreading allocation
    });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        name: dto.name,
        mobileNumber: dto.mobileNumber,
        role: 'MEMBER',
        isActive: true,
      },
    });
    return user;
  }
  /**
   * Verifies credentials against hashed representations.
   */
  async validateUserCredentials(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException({
        errors: 'InvalidCredentials',
        message: 'Invalid email credentials or password match failed.',
      });
    }
    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errors: 'InvalidCredentials',
        message: 'Invalid email credentials or password match failed.',
      });
    }
    // Circuit Breaker Rule
    if (!user.isActive) {
      throw new ForbiddenException('Your account is currently inactive.');
    }
    return user;
  }
  /**
   * Compiles access token payloads.
   */
  async generateAccessToken(user: JwtPayload) {
    const payload: {
      sub: JwtPayload['id'];
      email: JwtPayload['email'];
      role: JwtPayload['role'];
    } = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret-token-key-dev-64',
      expiresIn: '15m',
    });
    return {
      accessToken,
      expiresInSeconds: 900,
    };
  }
  /**
   * Compiles refresh token payloads.
   */
  async generateRefreshToken(user: JwtPayload): Promise<string> {
    const payload: {
      sub: JwtPayload['id'];
      email: JwtPayload['email'];
      role: JwtPayload['role'];
    } = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET || 'refresh-secret-token-key-dev-128',
      expiresIn: '7d',
    });
  }
  /**
   * Performs signature checks for session rotation.
   */
  async verifyRefreshTokenSignature(token: string) {
    try {
      const payload: {
        sub: JwtPayload['id'];
        email: JwtPayload['email'];
        role: JwtPayload['role'];
      } = await this.jwtService.verifyAsync(token, {
        secret:
          process.env.JWT_REFRESH_SECRET || 'refresh-secret-token-key-dev-128',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('Session expired or user not found.');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Your account is currently inactive.');
      }
      return user;
    } catch {
      throw new UnauthorizedException(
        'Refresh token is invalid, expired, or has been revoked.',
      );
    }
  }
}
