import { Test, TestingModule } from '@nestjs/testing';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import { TextPaginationDto } from './dto/text.dto';
import { TextFilterDto } from './dto/text-filter.dto';
import { NotFoundException } from '@nestjs/common';

// Mock del TextService: reemplaza las implementaciones reales por funciones spy
const mockTextService = {
  listTexts: jest.fn(),
  getRandomText: jest.fn(),
  getTextById: jest.fn(),
  getTextStats: jest.fn(),
};

describe('TextController', () => {
  let controller: TextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextController],
      providers: [{ provide: TextService, useValue: mockTextService }],
    }).compile();

    controller = module.get<TextController>(TextController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('listTexts', () => {
    it('debe delegar al servicio con los DTOs recibidos', async () => {
      const pagination: TextPaginationDto = { page: 1, limit: 10 };
      const filter: TextFilterDto = { difficultyId: 1 };
      const expected = { data: [], meta: {} };

      mockTextService.listTexts.mockResolvedValue(expected);

      const result = await controller.listTexts(pagination, filter);

      expect(mockTextService.listTexts).toHaveBeenCalledWith(
        pagination,
        filter,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getRandomText', () => {
    it('debe delegar al servicio con los filtros recibidos', async () => {
      const filter: TextFilterDto = { languageId: 1 };
      const expected = { id: 1, title: 'Texto aleatorio' };

      mockTextService.getRandomText.mockResolvedValue(expected);

      const result = await controller.getRandomText(filter);

      expect(mockTextService.getRandomText).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expected);
    });

    it('debe propagar NotFoundException si no hay textos', async () => {
      const filter: TextFilterDto = { difficultyId: 99 };

      mockTextService.getRandomText.mockRejectedValue(
        new NotFoundException(
          'No se encontraron textos con los filtros especificados',
        ),
      );

      await expect(controller.getRandomText(filter)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTextById', () => {
    it('debe retornar el texto cuando existe', async () => {
      const expected = { id: 1, title: 'Texto de prueba' };

      mockTextService.getTextById.mockResolvedValue(expected);

      const result = await controller.getTextById(1);

      expect(mockTextService.getTextById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });

    it('debe propagar NotFoundException si el texto no existe', async () => {
      mockTextService.getTextById.mockRejectedValue(
        new NotFoundException('Texto con ID 999 no encontrado'),
      );

      await expect(controller.getTextById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTextStats', () => {
    it('debe retornar las stats del texto cuando existe', async () => {
      const expected = { text: { id: 1 }, topSessions: [], stats: {} };

      mockTextService.getTextStats.mockResolvedValue(expected);

      const result = await controller.getTextStats(1);

      expect(mockTextService.getTextStats).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });

    it('debe propagar NotFoundException si el texto no existe', async () => {
      mockTextService.getTextStats.mockRejectedValue(
        new NotFoundException('Texto con ID 999 no encontrado'),
      );

      await expect(controller.getTextStats(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});