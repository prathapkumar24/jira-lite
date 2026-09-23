//import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
//import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../guards/roles.guard';
//import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRoleType } from '@jira-lite/contracts';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  //let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard],
    }).compile();

    guard = moduleRef.get<RolesGuard>(RolesGuard);
    //reflector = moduleRef.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required on the route', () => {
    // Arrange: Reflector returns undefined for roles
    const mockRequest = {
      user: { role: 'ADMIN' as UserRoleType },
    };
    const mockResponse = {};
    const mockNext = () => {};

    // 2. Wrap them inside the native NestJS class wrapper
    // Order matters: [req, res, next] maps exactly to Http context arguments
    const context = new ExecutionContextHost([
      mockRequest,
      mockResponse,
      mockNext,
    ]);

    // If your RolesGuard relies on context.getClass() or context.getHandler(),
    // you can safely spy and override them on this instance:
    jest.spyOn(context, 'getHandler').mockReturnValue(() => {});
    jest.spyOn(context, 'getClass').mockReturnValue(class TestController {});

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });

  /*
  it('should throw ForbiddenException if user has no role defined', () => {
    // Arrange
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN' as UserRoleType]);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: undefined }, // Missing role string
        }),
      }),
    });

    // Act & Assert
    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Access denied: No authentication profile found'),
    );
  });

  it('should throw ForbiddenException if user role does not match required roles', () => {
    // Arrange
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN' as UserRoleType]);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'DEVELOPER' as UserRoleType }, // Mismatched role
        }),
      }),
    });

    // Act & Assert
    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Access denied: You do not have the required permissions'),
    );
  });

  it('should return true if user role matches required roles', () => {
    // Arrange
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN' as UserRoleType, 'MANAGER' as UserRoleType]);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'ADMIN' as UserRoleType }, // Matching role
        }),
      }),
    });

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });*/
});
