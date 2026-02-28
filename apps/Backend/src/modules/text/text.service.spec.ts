import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TextService } from './text.service';
import { PrismaService } from '../../Prisma/prisma.service';
import { TextPaginationDto } from './dto/text.dto';
import { TextFilterDto } from './dto/text-filter.dto';

// Fábricas de datos de prueba para mantener los tests DRY
const makeText = (overrides = {}) => ({
  id: 1,
  title: 'Texto de prueba',
  content: 'Contenido del texto',
  difficultyId: 1,
  typeId: 1,
  languageId: 1,
  createdAt: new Date(),
  difficulty: { id: 1, name: 'Fácil', description: null },
  type: { id: 1, name: 'Código', description: null },
  language: { id: 1, name: 'Español', code: 'es' },
  createdBy: { id: 1, username: 'admin' },
  ...overrides,
});

const makeSession = (overrides = {}) => ({
  id: 1,
  wpm: 80,
  accuracy: 97.5,
  timeSeconds: 60,
  errorRate: 2.5,
  createdAt: new Date(),
  user: { id: 1, username: 'usuario1' },
  ...overrides,
});

// Mock del PrismaService con los métodos necesarios
const mockPrisma = {
  text: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  typingSession: {
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
};

describe('TextService', () => {
  let service: TextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TextService>(TextService);
  });

  afterEach(() => jest.clearAllMocks());

  // ──────────────────────────────────────────
  // listTexts
  // ──────────────────────────────────────────
  describe('listTexts', () => {
    it('debe retornar textos paginados con metadatos', async () => {
      const texts = [makeText()];
      mockPrisma.text.findMany.mockResolvedValue(texts);
      mockPrisma.text.count.mockResolvedValue(1);

      const pagination: TextPaginationDto = { page: 1, limit: 10 };
      const filter: TextFilterDto = {};

      const result = await service.listTexts(pagination, filter);

      expect(result.data).toEqual(texts);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('debe calcular hasNextPage correctamente', async () => {
      mockPrisma.text.findMany.mockResolvedValue([makeText()]);
      mockPrisma.text.count.mockResolvedValue(25);

      const result = await service.listTexts({ page: 1, limit: 10 }, {});

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
    });

    it('debe aplicar filtros de dificultad, tipo e idioma', async () => {
      mockPrisma.text.findMany.mockResolvedValue([]);
      mockPrisma.text.count.mockResolvedValue(0);

      const filter: TextFilterDto = {
        difficultyId: 1,
        typeId: 2,
        languageId: 1,
      };
      await service.listTexts({ page: 1, limit: 10 }, filter);

      const whereUsed = mockPrisma.text.findMany.mock.calls[0][0] as {
        where: Prisma.TextWhereInput;
      };
      expect(whereUsed.where.difficultyId).toBe(1);
      expect(whereUsed.where.typeId).toBe(2);
      expect(whereUsed.where.languageId).toBe(1);
    });
  });

  // ──────────────────────────────────────────
  // getRandomText
  // ──────────────────────────────────────────
  describe('getRandomText', () => {
    it('debe retornar un texto aleatorio', async () => {
      const text = makeText();
      mockPrisma.text.count.mockResolvedValue(5);
      mockPrisma.text.findMany.mockResolvedValue([text]);

      const result = await service.getRandomText({});

      expect(result).toEqual(text);
      expect(mockPrisma.text.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 }),
      );
    });

    it('debe lanzar NotFoundException si no hay textos con esos filtros', async () => {
      mockPrisma.text.count.mockResolvedValue(0);

      await expect(service.getRandomText({ difficultyId: 99 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────
  // getTextById
  // ──────────────────────────────────────────
  describe('getTextById', () => {
    it('debe retornar el texto cuando existe', async () => {
      const text = makeText();
      mockPrisma.text.findUnique.mockResolvedValue(text);

      const result = await service.getTextById(1);

      expect(result).toEqual(text);
      expect(mockPrisma.text.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });

    it('debe lanzar NotFoundException si el texto no existe', async () => {
      mockPrisma.text.findUnique.mockResolvedValue(null);

      await expect(service.getTextById(999)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si el texto no tiene dificultad', async () => {
      mockPrisma.text.findUnique.mockResolvedValue({
        ...makeText(),
        difficulty: null,
      });

      await expect(service.getTextById(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────
  // getTextStats
  // ──────────────────────────────────────────
  describe('getTextStats', () => {
    it('debe retornar las stats y el top 10 del texto', async () => {
      const text = { id: 1, title: 'Texto de prueba' };
      const sessions = [makeSession(), makeSession({ id: 2, wpm: 90 })];
      const aggregate = {
        _avg: { wpm: 85, accuracy: 97, errorRate: 3 },
        _max: { wpm: 90, accuracy: 99 },
        _count: { id: 2 },
      };

      mockPrisma.text.findUnique.mockResolvedValue(text);
      mockPrisma.typingSession.findMany.mockResolvedValue(sessions);
      mockPrisma.typingSession.aggregate.mockResolvedValue(aggregate);

      const result = await service.getTextStats(1);

      expect(result.text).toEqual(text);
      expect(result.topSessions).toHaveLength(2);
      expect(result.stats.totalAttempts).toBe(2);
      expect(result.stats.avgWpm).toBe(85);
      expect(result.stats.maxWpm).toBe(90);
    });

    it('debe lanzar NotFoundException si el texto no existe', async () => {
      mockPrisma.text.findUnique.mockResolvedValue(null);

      await expect(service.getTextStats(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
