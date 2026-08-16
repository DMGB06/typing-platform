/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TypingSessionsService } from './typing-sessions.service';
import { PrismaService } from '../../Prisma/prisma.service';
import { CreateTypingSessionDto } from './dto/typing.dto';
import { TypingSession } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockText = {
  id: 1,
  title: 'Test text',
  isActive: true,
  difficultyId: 2,
};

const mockSession = {
  id: 10,
  userId: 1,
  textId: 1,
  wpm: 80,
  accuracy: 95,
  timeSeconds: 60,
  errorRate: 5,
  improvementRate: null,
  createdAt: new Date(),
};

const dto: CreateTypingSessionDto = {
  textId: 1,
  wpm: 80,
  accuracy: 95,
  timeSeconds: 60,
  errorRate: 5,
};

// ─── Mock PrismaService ───────────────────────────────────────────────────────

const prismaMock = {
  text: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  typingSession: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  typingError: {
    createMany: jest.fn(),
  },
  userStatsByDifficulty: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userTextHistory: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockNotificationsService = {
  createPersonalBestNotification: jest.fn(),
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('TypingSessionsService', () => {
  let service: TypingSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypingSessionsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<TypingSessionsService>(TypingSessionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create() ──────────────────────────────────────────────────────────────

  describe('create()', () => {
    beforeEach(() => {
      prismaMock.text.findFirst.mockResolvedValue(mockText);
      prismaMock.typingSession.findFirst.mockResolvedValue(null); // sin WPM previo
      prismaMock.typingSession.create.mockResolvedValue(mockSession);
      prismaMock.typingError.createMany.mockResolvedValue({ count: 0 });
      prismaMock.userTextHistory.findUnique.mockResolvedValue(null);
      prismaMock.userTextHistory.create.mockResolvedValue({});
      prismaMock.userStatsByDifficulty.findUnique.mockResolvedValue(null);
      prismaMock.userStatsByDifficulty.create.mockResolvedValue({});
    });

    it('devuelve la sesión creada', async () => {
      const result: TypingSession = await service.create(1, dto);
      expect(result).toEqual(mockSession);
    });

    it('lanza NotFoundException si el texto no existe o está inactivo', async () => {
      prismaMock.text.findFirst.mockResolvedValue(null);
      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('llama a typingSession.create con los datos correctos', async () => {
      await service.create(1, dto);
      expect(prismaMock.typingSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 1, textId: 1, wpm: 80 }),
        }),
      );
    });

    it('calcula improvementRate cuando hay WPM previo', async () => {
      prismaMock.typingSession.findFirst.mockResolvedValue({ wpm: 40 });
      await service.create(1, dto); // nuevo wpm=80, prev=40 → mejora 100%
      expect(prismaMock.typingSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ improvementRate: 100 }),
        }),
      );
    });

    it('guarda los errores si el dto los incluye', async () => {
      const dtoWithErrors: CreateTypingSessionDto = {
        ...dto,
        errors: [{ wrongWord: 'teh', correctWord: 'the', position: 3 }],
      };
      await service.create(1, dtoWithErrors);
      expect(prismaMock.typingError.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ wrongWord: 'teh', correctWord: 'the' }),
          ]),
        }),
      );
    });

    it('no llama a createMany si no hay errores', async () => {
      await service.create(1, dto);
      expect(prismaMock.typingError.createMany).not.toHaveBeenCalled();
    });

    it('crea stats nuevas si el usuario no tiene stats previas en esa dificultad', async () => {
      await service.create(1, dto);
      expect(prismaMock.userStatsByDifficulty.create).toHaveBeenCalled();
      expect(prismaMock.userStatsByDifficulty.update).not.toHaveBeenCalled();
    });

    it('actualiza stats existentes recalculando promedios', async () => {
      prismaMock.userStatsByDifficulty.findUnique.mockResolvedValue({
        totalSessions: 4,
        bestWpm: 70,
        avgWpm: 60,
        avgAccuracy: 90,
        avgErrorRate: 6,
      });
      prismaMock.userStatsByDifficulty.update.mockResolvedValue({});
      await service.create(1, dto);
      expect(prismaMock.userStatsByDifficulty.update).toHaveBeenCalled();
      expect(prismaMock.userStatsByDifficulty.create).not.toHaveBeenCalled();
    });

    it('crea una notificación de récord personal cuando el wpm supera el bestWpm anterior', async () => {
      prismaMock.userStatsByDifficulty.findUnique.mockResolvedValue({
        totalSessions: 4,
        bestWpm: 70,
        avgWpm: 60,
        avgAccuracy: 90,
        avgErrorRate: 6,
      });
      prismaMock.userStatsByDifficulty.update.mockResolvedValue({});

      await service.create(1, dto); // dto.wpm = 80 > 70

      expect(
        mockNotificationsService.createPersonalBestNotification,
      ).toHaveBeenCalledWith(1, mockText.difficultyId, 80);
    });

    it('no crea notificación cuando el wpm no supera el bestWpm anterior', async () => {
      prismaMock.userStatsByDifficulty.findUnique.mockResolvedValue({
        totalSessions: 4,
        bestWpm: 90,
        avgWpm: 60,
        avgAccuracy: 90,
        avgErrorRate: 6,
      });
      prismaMock.userStatsByDifficulty.update.mockResolvedValue({});

      await service.create(1, dto); // dto.wpm = 80 < 90

      expect(
        mockNotificationsService.createPersonalBestNotification,
      ).not.toHaveBeenCalled();
    });

    it('no crea notificación en la primera sesión del usuario en esa dificultad', async () => {
      await service.create(1, dto); // findUnique ya resuelve null por el beforeEach de create()

      expect(
        mockNotificationsService.createPersonalBestNotification,
      ).not.toHaveBeenCalled();
    });

    it('un error al crear la notificación no hace fallar la creación de la sesión', async () => {
      prismaMock.userStatsByDifficulty.findUnique.mockResolvedValue({
        totalSessions: 4,
        bestWpm: 70,
        avgWpm: 60,
        avgAccuracy: 90,
        avgErrorRate: 6,
      });
      prismaMock.userStatsByDifficulty.update.mockResolvedValue({});
      mockNotificationsService.createPersonalBestNotification.mockRejectedValue(
        new Error('DB down'),
      );

      const result = await service.create(1, dto);

      expect(result).toEqual(mockSession);
    });

    it('crea historial nuevo si el usuario no tiene historial en ese texto', async () => {
      await service.create(1, dto);
      expect(prismaMock.userTextHistory.create).toHaveBeenCalled();
      expect(prismaMock.userTextHistory.update).not.toHaveBeenCalled();
    });

    it('actualiza historial existente e incrementa totalAttempts', async () => {
      prismaMock.userTextHistory.findUnique.mockResolvedValue({
        bestWpm: 60,
        bestAccuracy: 90,
        totalAttempts: 3,
      });
      prismaMock.userTextHistory.update.mockResolvedValue({});
      await service.create(1, dto);
      expect(prismaMock.userTextHistory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAttempts: { increment: 1 },
          }),
        }),
      );
    });
  });

  // ── findMyRecent() ────────────────────────────────────────────────────────

  describe('findMyRecent()', () => {
    it('devuelve las últimas 20 sesiones por defecto', async () => {
      prismaMock.typingSession.findMany.mockResolvedValue([mockSession]);
      const result: TypingSession[] = await service.findMyRecent(1);
      expect(prismaMock.typingSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 }, take: 20 }),
      );
      expect(result).toEqual([mockSession]);
    });

    it('respeta el límite custom', async () => {
      prismaMock.typingSession.findMany.mockResolvedValue([]);
      await service.findMyRecent(1, 5);
      expect(prismaMock.typingSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  // ── findByText() ──────────────────────────────────────────────────────────

  describe('findByText()', () => {
    it('devuelve sesiones del usuario en ese texto', async () => {
      prismaMock.text.findUnique.mockResolvedValue(mockText);
      prismaMock.typingSession.findMany.mockResolvedValue([mockSession]);
      const result: TypingSession[] = await service.findByText(1, 1);
      expect(result).toEqual([mockSession]);
    });

    it('lanza NotFoundException si el texto no existe', async () => {
      prismaMock.text.findUnique.mockResolvedValue(null);
      await expect(service.findByText(99, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findById() ────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('devuelve la sesión con sus errores', async () => {
      prismaMock.typingSession.findUnique.mockResolvedValue({
        ...mockSession,
        errors: [],
      });
      const result: TypingSession & { errors: any[] } = await service.findById(
        1,
        10,
      );
      expect(result).toMatchObject({ id: 10, userId: 1 });
    });

    it('lanza NotFoundException si la sesión no existe', async () => {
      prismaMock.typingSession.findUnique.mockResolvedValue(null);
      await expect(service.findById(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el userId no coincide', async () => {
      prismaMock.typingSession.findUnique.mockResolvedValue({
        ...mockSession,
        userId: 99, // otro usuario
        errors: [],
      });
      await expect(service.findById(1, 10)).rejects.toThrow(ForbiddenException);
    });
  });
});
