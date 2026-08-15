import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  // Mock de UsersService
  const mockUsersService = {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    adminUpdateUser: jest.fn(),
    deleteUser: jest.fn(),
    getMyStats: jest.fn(),
    getMyPreferences: jest.fn(),
    updateMyPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Puedes agregar más tests aquí cuando los necesites

  describe('getMyStats', () => {
    it('returns the stats for the authenticated user', async () => {
      const mockRequest = {
        user: { id: 1, email: 'ana@test.com', role: 'USER' },
      } as unknown as Request;
      const stats = [
        {
          difficultyId: 1,
          difficultyName: 'Fácil',
          bestWpm: 65,
          avgWpm: 52,
          avgAccuracy: 96.4,
          totalSessions: 12,
          avgErrorRate: 3.1,
        },
      ];
      mockUsersService.getMyStats.mockResolvedValue(stats);

      const result = await controller.getMyStats(mockRequest);

      expect(mockUsersService.getMyStats).toHaveBeenCalledWith(1);
      expect(result).toEqual(stats);
    });

    it('throws ForbiddenException if there is no user on the request', async () => {
      const mockRequest = {} as unknown as Request;

      await expect(controller.getMyStats(mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUsersService.getMyStats).not.toHaveBeenCalled();
    });
  });

  describe('getMyPreferences', () => {
    it('returns the preferences for the authenticated user', async () => {
      const mockRequest = {
        user: { id: 1, email: 'ana@test.com', role: 'USER' },
      } as unknown as Request;
      mockUsersService.getMyPreferences.mockResolvedValue({
        defaultDifficultyId: 2,
      });

      const result = await controller.getMyPreferences(mockRequest);

      expect(mockUsersService.getMyPreferences).toHaveBeenCalledWith(1);
      expect(result).toEqual({ defaultDifficultyId: 2 });
    });

    it('throws ForbiddenException if there is no user on the request', async () => {
      const mockRequest = {} as unknown as Request;

      await expect(controller.getMyPreferences(mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUsersService.getMyPreferences).not.toHaveBeenCalled();
    });
  });

  describe('updateMyPreferences', () => {
    it('delegates to the service with the authenticated user id and the DTO value', async () => {
      const mockRequest = {
        user: { id: 1, email: 'ana@test.com', role: 'USER' },
      } as unknown as Request;
      mockUsersService.updateMyPreferences.mockResolvedValue({
        defaultDifficultyId: 3,
      });

      const result = await controller.updateMyPreferences(
        { defaultDifficultyId: 3 },
        mockRequest,
      );

      expect(mockUsersService.updateMyPreferences).toHaveBeenCalledWith(1, 3);
      expect(result).toEqual({ defaultDifficultyId: 3 });
    });

    it('throws ForbiddenException if there is no user on the request', async () => {
      const mockRequest = {} as unknown as Request;

      await expect(
        controller.updateMyPreferences({ defaultDifficultyId: 3 }, mockRequest),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUsersService.updateMyPreferences).not.toHaveBeenCalled();
    });
  });
});
