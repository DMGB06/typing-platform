import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { replayTyping } from './typing-result';
import { TypingSessionsService } from './typing-sessions.service';

describe('typing replay', () => {
  it('counts corrected mistakes and uses unrounded elapsed time for WPM', () => {
    const result = replayTyping('abcde', ['x', 'Backspace', ...'abcde'], 1500);
    expect(result.wpm).toBe(40);
    expect(result.timeSeconds).toBe(2);
    expect(result.accuracy).toBeCloseTo((100 * 5) / 6);
    expect(result.errorRate).toBeCloseTo(100 / 6);
    expect(result.errors).toEqual([
      { wrongWord: 'x', correctWord: 'a', position: 0 },
    ]);
  });

  it('accepts zero accuracy and treats a Unicode code point as one character', () => {
    expect(replayTyping('🟢', ['x'], 0)).toMatchObject({
      wpm: 0,
      accuracy: 0,
      errorRate: 100,
      timeSeconds: 1,
    });
    expect(replayTyping('🟢\r\n', ['🟢', '\n'], 0)).toMatchObject({
      wpm: 24,
      accuracy: 100,
    });
  });

  it.each(
    [
      ['Backspace', 'a', 'b'],
      ['a'],
      ['a', 'b', 'c'],
      ['two', 'b'],
      Array.from({ length: 21 }, () => 'x'),
    ].map((events) => ({ events })),
  )('rejects a malformed replay $events', ({ events }) => {
    expect(() => replayTyping('ab', events, 1000)).toThrow();
  });
});

describe('TypingSessionsService history', () => {
  const prisma = {
    typingSession: { findMany: jest.fn(), findUnique: jest.fn() },
  };
  const service = new TypingSessionsService(
    prisma as unknown as PrismaService,
    {} as NotificationsService,
  );

  it('keeps the recent session limit', async () => {
    prisma.typingSession.findMany.mockResolvedValue([]);
    await expect(service.findMyRecent(1)).resolves.toEqual([]);
    expect(prisma.typingSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 }, take: 20 }),
    );
  });

  it('enforces session ownership', async () => {
    prisma.typingSession.findUnique.mockResolvedValue({
      id: 3,
      userId: 4,
      errors: [],
    });
    await expect(service.findById(4, 3)).resolves.toMatchObject({
      id: 3,
      errors: [],
    });
    await expect(service.findById(5, 3)).rejects.toThrow(ForbiddenException);
    prisma.typingSession.findUnique.mockResolvedValue(null);
    await expect(service.findById(4, 3)).rejects.toThrow(NotFoundException);
  });
});
