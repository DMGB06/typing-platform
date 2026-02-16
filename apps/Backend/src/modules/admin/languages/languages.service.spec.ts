import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesService } from './languages.service';
import { PrismaService } from '../../../Prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('LanguagesService', () => {
  let service: LanguagesService;
  const mockPrismaService = {
    language: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new language', async () => {
      const dto = { name: 'English', code: 'en' };
      mockPrismaService.language.findFirst.mockResolvedValue(null);
      mockPrismaService.language.findUnique.mockResolvedValue(null);
      mockPrismaService.language.create.mockResolvedValue({
        id: 1,
        name: 'english',
        code: 'en',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, name: 'english', code: 'en' });
      expect(mockPrismaService.language.findFirst).toHaveBeenCalledWith({
        where: { name: 'english' },
      });
      expect(mockPrismaService.language.findUnique).toHaveBeenCalledWith({
        where: { code: 'en' },
      });
      expect(mockPrismaService.language.create).toHaveBeenCalledWith({
        data: { name: 'english', code: 'en' },
      });
    });

    it('should throw ConflictException if name already exists', async () => {
      const dto = { name: 'English', code: 'en' };
      mockPrismaService.language.findFirst.mockResolvedValue({
        id: 1,
        name: 'english',
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.language.findFirst).toHaveBeenCalledWith({
        where: { name: 'english' },
      });
    });

    it('should throw ConflictException if code already exists', async () => {
      const dto = { name: 'English', code: 'en' };
      mockPrismaService.language.findFirst.mockResolvedValue(null);
      mockPrismaService.language.findUnique.mockResolvedValue({
        id: 1,
        code: 'en',
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.language.findUnique).toHaveBeenCalledWith({
        where: { code: 'en' },
      });
    });
  });

  describe('update', () => {
    it('should update a language', async () => {
      const dto = { name: 'Updated English', code: 'en' };
      mockPrismaService.language.findUnique.mockResolvedValueOnce({
        id: 1,
        name: 'english',
        code: 'en',
      });
      mockPrismaService.language.findFirst.mockResolvedValue(null);
      mockPrismaService.language.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.language.update.mockResolvedValue({
        id: 1,
        name: 'updated english',
        code: 'en',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update(1, dto);
      expect(result).toEqual({ id: 1, name: 'updated english', code: 'en' });
    });

    it('should throw NotFoundException if language does not exist', async () => {
      const dto = { name: 'Updated English' };
      mockPrismaService.language.findUnique.mockResolvedValue(null);

      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if name already exists', async () => {
      const dto = { name: 'Updated English' };
      mockPrismaService.language.findUnique.mockResolvedValueOnce({
        id: 1,
        name: 'english',
      });
      mockPrismaService.language.findFirst.mockResolvedValue({
        id: 2,
        name: 'updated english',
      });

      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should deactivate a language', async () => {
      mockPrismaService.language.findUnique.mockResolvedValue({
        id: 1,
        name: 'english',
        code: 'en',
        isActive: true,
      });
      mockPrismaService.language.update.mockResolvedValue({
        id: 1,
        name: 'english',
        code: 'en',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.delete(1);
      expect(result).toEqual({
        id: 1,
        name: 'english',
        code: 'en',
        isActive: false,
      });
      expect(mockPrismaService.language.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if language does not exist', async () => {
      mockPrismaService.language.findUnique.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('should return all active languages with pagination', async () => {
      const mockLanguages = [
        { id: 1, name: 'english', code: 'en' },
        { id: 2, name: 'spanish', code: 'es' },
      ];
      mockPrismaService.language.findMany.mockResolvedValue(mockLanguages);
      mockPrismaService.language.count.mockResolvedValue(2);

      const result = await service.getAll(1, 50);
      expect(result).toEqual({
        data: mockLanguages,
        meta: {
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
      expect(mockPrismaService.language.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 50,
      });
    });
  });

  describe('getById', () => {
    it('should return a language by id', async () => {
      const mockLanguage = { id: 1, name: 'english', code: 'en' };
      mockPrismaService.language.findUnique.mockResolvedValue(mockLanguage);

      const result = await service.getById(1);
      expect(result).toEqual(mockLanguage);
      expect(mockPrismaService.language.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, name: true, code: true },
      });
    });

    it('should throw NotFoundException if language does not exist', async () => {
      mockPrismaService.language.findUnique.mockResolvedValue(null);

      await expect(service.getById(1)).rejects.toThrow(NotFoundException);
    });
  });
});
