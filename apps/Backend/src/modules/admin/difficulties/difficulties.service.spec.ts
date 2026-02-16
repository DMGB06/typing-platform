import { Test, TestingModule } from '@nestjs/testing';
import { DifficultiesAdminService } from './difficulties.service';
import { PrismaService } from '../../../Prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DifficultiesAdminService', () => {
  let service: DifficultiesAdminService;

  const mockPrismaService = {
    difficulty: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DifficultiesAdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DifficultiesAdminService>(DifficultiesAdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDifficulty', () => {
    it('should create a difficulty successfully', async () => {
      const createDto = {
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
      };
      const createdDifficulty = {
        id: 1,
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
        isActive: true,
        createdAt: new Date(),
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValue(null);
      mockPrismaService.difficulty.findFirst.mockResolvedValue(null);
      mockPrismaService.difficulty.create.mockResolvedValue(createdDifficulty);

      const result = await service.createDifficulty(createDto);

      expect(mockPrismaService.difficulty.findUnique).toHaveBeenCalledWith({
        where: { name: 'easy' },
      });
      expect(mockPrismaService.difficulty.findFirst).toHaveBeenCalledWith({
        where: { orderIndex: 1 },
      });
      expect(result).toEqual({
        id: 1,
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
      });
    });

    it('should throw ConflictException if name already exists', async () => {
      const createDto = {
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValue({
        id: 1,
        name: 'easy',
      });

      await expect(service.createDifficulty(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if orderIndex already exists', async () => {
      const createDto = {
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValue(null);
      mockPrismaService.difficulty.findFirst.mockResolvedValue({
        id: 1,
        orderIndex: 1,
      });

      await expect(service.createDifficulty(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateDifficulty', () => {
    it('should update a difficulty successfully', async () => {
      const updateDto = {
        name: 'medium',
        description: 'Medium level',
        orderIndex: 2,
      };
      const existingDifficulty = {
        id: 1,
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
        isActive: true,
        createdAt: new Date(),
      };
      const updatedDifficulty = {
        id: 1,
        name: 'medium',
        description: 'Medium level',
        orderIndex: 2,
        isActive: true,
        createdAt: new Date(),
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValueOnce(
        existingDifficulty,
      );
      mockPrismaService.difficulty.findFirst.mockResolvedValue(null);
      mockPrismaService.difficulty.update.mockResolvedValue(updatedDifficulty);

      const result = await service.updateDifficulty(1, updateDto);

      expect(result).toEqual({
        id: 1,
        name: 'medium',
        description: 'Medium level',
        orderIndex: 2,
        isActive: true,
      });
    });

    it('should throw NotFoundException if difficulty does not exist', async () => {
      const updateDto = {
        name: 'medium',
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValue(null);

      await expect(service.updateDifficulty(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if name already exists', async () => {
      const updateDto = {
        name: 'medium',
        description: 'Medium level',
        orderIndex: 2,
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValueOnce({
        id: 1,
        name: 'easy',
      });
      mockPrismaService.difficulty.findFirst.mockResolvedValueOnce({
        id: 2,
        name: 'medium',
      });

      await expect(service.updateDifficulty(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getDifficulties', () => {
    it('should return paginated difficulties', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const difficulties = [
        {
          id: 1,
          name: 'easy',
          description: 'Easy level',
          orderIndex: 1,
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: 'medium',
          description: 'Medium level',
          orderIndex: 2,
          isActive: true,
          createdAt: new Date(),
        },
      ];

      mockPrismaService.difficulty.findMany.mockResolvedValue(difficulties);
      mockPrismaService.difficulty.count.mockResolvedValue(5);

      const result = await service.getDifficulties(paginationDto);

      expect(mockPrismaService.difficulty.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          orderIndex: true,
          isActive: true,
        },
      });
      expect(result).toEqual({
        data: difficulties,
        meta: {
          total: 5,
          page: 1,
          limit: 10,
          lastPage: 1,
        },
      });
    });
  });

  describe('getDifficultyById', () => {
    it('should return a difficulty by id', async () => {
      const difficulty = {
        id: 1,
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
        isActive: true,
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValue(difficulty);

      const result = await service.getDifficultyById(1);

      expect(mockPrismaService.difficulty.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          description: true,
          orderIndex: true,
          isActive: true,
        },
      });
      expect(result).toEqual({
        id: 1,
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
        isActive: true,
      });
    });

    it('should throw NotFoundException if difficulty not found', async () => {
      mockPrismaService.difficulty.findUnique.mockResolvedValue(null);

      await expect(service.getDifficultyById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteDifficulty', () => {
    it('should deactivate a difficulty successfully', async () => {
      const difficulty = {
        id: 1,
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
        isActive: true,
        createdAt: new Date(),
      };
      const deactivatedDifficulty = {
        ...difficulty,
        isActive: false,
      };

      mockPrismaService.difficulty.findUnique.mockResolvedValue(difficulty);
      mockPrismaService.difficulty.update.mockResolvedValue(
        deactivatedDifficulty,
      );

      const result = await service.deleteDifficulty(1);

      expect(mockPrismaService.difficulty.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual({
        id: 1,
        name: 'easy',
        description: 'Easy level',
        isActive: false,
      });
    });

    it('should throw NotFoundException if difficulty not found', async () => {
      mockPrismaService.difficulty.findUnique.mockResolvedValue(null);

      await expect(service.deleteDifficulty(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
