import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

// 1. MOCK ARGON2 GLOBALLY: Bypasses heavy CPU calculations during test runs
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('mocked_argon2_hash_value'),
  verify: jest.fn(),
  argon2id: 2, // Emulate enum value structure
}));

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // 2. ARRANGE MOCK CORE LAYERS: Isolates our code from network/IO connections
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear tracking histories between blocks
  });

  // =========================================================================
  // SECTION 1: registerUser()
  // =========================================================================
  describe('registerUser()', () => {
    const mockRegisterDto = {
      email: 'test@example.com',
      username: 'tester',
      passwordHash: 'RawUserPasswordString123!',
      name: 'Test User',
      mobileNumber: '1234567890',
    };

    it('should successfully hash the password and create a new user (Happy Path)', async () => {
      // ARRANGE
      mockPrismaService.user.findUnique.mockResolvedValue(null); // No email exists
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        ...mockRegisterDto,
        passwordHash: 'mocked_argon2_hash_value',
        role: 'MEMBER',
        isActive: true,
      });

      // ACT
      const result = await authService.registerUser(mockRegisterDto);

      // ASSERT
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(argon2.hash).toHaveBeenCalledWith(
        mockRegisterDto.passwordHash,
        expect.any(Object),
      );
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe(mockRegisterDto.email);
      expect(result.role).toBe('MEMBER');
    });

    it('should throw ConflictException if the email address is already taken (Sad Path)', async () => {
      // ARRANGE
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: mockRegisterDto.email,
      });

      // ACT & ASSERT
      await expect(authService.registerUser(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled(); // Structural Protection Check
    });
  });

  // =========================================================================
  // SECTION 2: validateUserCredentials()
  // =========================================================================
  describe('validateUserCredentials()', () => {
    const mockLoginDto = {
      email: 'login@test.com',
      passwordHash: 'inputPassword',
    };
    const dbUserMock = {
      id: 1,
      email: 'login@test.com',
      passwordHash: 'storedHash',
      isActive: true,
    };

    it('should return user object if email and password match perfectly (Happy Path)', async () => {
      // ARRANGE
      mockPrismaService.user.findUnique.mockResolvedValue(dbUserMock);
      (argon2.verify as jest.Mock).mockResolvedValue(true); // Password check passes

      // ACT
      const result = await authService.validateUserCredentials(mockLoginDto);

      // ASSERT
      expect(result).toEqual(dbUserMock);
    });

    it('should throw UnauthorizedException if the user record is not found', async () => {
      // ARRANGE
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(
        authService.validateUserCredentials(mockLoginDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the password verification fails', async () => {
      // ARRANGE
      mockPrismaService.user.findUnique.mockResolvedValue(dbUserMock);
      (argon2.verify as jest.Mock).mockResolvedValue(false); // Password check fails

      // ACT & ASSERT
      await expect(
        authService.validateUserCredentials(mockLoginDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user account has isActive set to false (Circuit Breaker)', async () => {
      // ARRANGE
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...dbUserMock,
        isActive: false,
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      // ACT & ASSERT
      await expect(
        authService.validateUserCredentials(mockLoginDto),
      ).rejects.toThrow(
        new UnauthorizedException('Your account is currently inactive.'),
      );
    });
  });

  // =========================================================================
  // SECTION 3: Token Compilations
  // =========================================================================
  describe('Token Generation Layer', () => {
    const mockPayloadInput = {
      id: '99',
      email: 'payload@test.com',
      role: 'MEMBER',
    } as const;

    it('generateAccessToken() should compile and assign structured signature criteria', async () => {
      // ARRANGE
      mockJwtService.signAsync.mockResolvedValue('signed_access_token_string');

      // ACT
      const result = await authService.generateAccessToken(mockPayloadInput);

      // ASSERT
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: '99', email: 'payload@test.com', role: 'MEMBER' },
        expect.objectContaining({ expiresIn: '15m' }),
      );
      expect(result.accessToken).toBe('signed_access_token_string');
      expect(result.expiresInSeconds).toBe(900);
    });

    it('generateRefreshToken() should return string signature directly', async () => {
      // ARRANGE
      mockJwtService.signAsync.mockResolvedValue('signed_refresh_token_string');

      // ACT
      const result = await authService.generateRefreshToken(mockPayloadInput);

      // ASSERT
      expect(result).toBe('signed_refresh_token_string');
    });
  });

  // =========================================================================
  // SECTION 4: verifyRefreshTokenSignature()
  // =========================================================================
  describe('verifyRefreshTokenSignature()', () => {
    const validToken = 'good_refresh_token';
    const jwtDecodedPayload = {
      sub: 99,
      email: 'payload@test.com',
      role: 'MEMBER',
    };
    const activeDbUser = { id: 99, email: 'payload@test.com', isActive: true };

    it('should validate signature and return active user profile from DB', async () => {
      // ARRANGE
      mockJwtService.verifyAsync.mockResolvedValue(jwtDecodedPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(activeDbUser);

      // ACT
      const result = await authService.verifyRefreshTokenSignature(validToken);

      // ASSERT
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        validToken,
        expect.any(Object),
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: jwtDecodedPayload.sub },
      });
      expect(result).toEqual(activeDbUser);
    });

    it('should catch validation errors and convert them into an UnauthorizedException uniform wrapper', async () => {
      // ARRANGE
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Signature expired'),
      ); // Token tampering scenario

      // ACT & ASSERT
      await expect(
        authService.verifyRefreshTokenSignature(validToken),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Refresh token is invalid, expired, or has been revoked.',
        ),
      );
    });
  });
});
