import { Test, TestingModule } from '@nestjs/testing';
import { TextService } from './text.service';
import { PrismaService } from '../../../Prisma/prisma.service';

describe('TextService', () => {
  let service: TextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextService,
        {
          provide: PrismaService,
          useValue: {
            text: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            difficulty: {
              findUnique: jest.fn(),
            },
            textType: {
              findUnique: jest.fn(),
            },
            language: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TextService>(TextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
