import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/languages.dto';

describe('LanguagesController', () => {
  let controller: LanguagesController;

  const mockLanguagesService = {
    create: jest.fn<CreateLanguageDto, [CreateLanguageDto]>((dto) => ({
      id: 1,
      ...dto,
    })),
    update: jest.fn<UpdateLanguageDto, [number, UpdateLanguageDto]>(
      (id, dto) => ({
        id,
        ...dto,
      }),
    ),
    delete: jest.fn((id: number) => ({
      id,
      name: 'English',
      code: 'en',
      isActive: false,
    })),
    getAll: jest.fn(() => ({
      data: [
        { id: 1, name: 'English', code: 'en' },
        { id: 2, name: 'Spanish', code: 'es' },
      ],
      meta: {
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    })),
    getById: jest.fn((id: number) => ({
      id,
      name: 'English',
      code: 'en',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        {
          provide: LanguagesService,
          useValue: mockLanguagesService,
        },
      ],
    }).compile();

    controller = module.get<LanguagesController>(LanguagesController);

    // Limpiar los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new language', async () => {
      const dto: CreateLanguageDto = { name: 'English', code: 'en' };
      const result = await controller.create(dto);

      expect(result).toEqual({
        id: 1,
        ...dto,
      });
      expect(mockLanguagesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a language', async () => {
      const dto: UpdateLanguageDto = { name: 'Updated English', code: 'en' };
      const result = await controller.update(1, dto);

      expect(result).toEqual({
        id: 1,
        ...dto,
      });
      expect(mockLanguagesService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a language', async () => {
      const result = await controller.deactivate(1);

      expect(result).toEqual({
        id: 1,
        name: 'English',
        code: 'en',
        isActive: false,
      });
      expect(mockLanguagesService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return all languages', async () => {
      const result = await controller.findAll();

      expect(result).toEqual({
        data: [
          { id: 1, name: 'English', code: 'en' },
          { id: 2, name: 'Spanish', code: 'es' },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
      expect(mockLanguagesService.getAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single language', async () => {
      const result = await controller.findOne(1);

      expect(result).toEqual({
        id: 1,
        name: 'English',
        code: 'en',
      });
      expect(mockLanguagesService.getById).toHaveBeenCalledWith(1);
    });
  });
});
