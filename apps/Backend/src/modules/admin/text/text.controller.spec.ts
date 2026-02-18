import { Test, TestingModule } from '@nestjs/testing';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import {
  CreateTextDto,
  UpdateTextDto,
  FilterTextDto,
  PaginationTextDto,
} from './dto/text.dto';
import { UserRole } from '../../../types/user.types';
import type { Request } from 'express';

describe('TextController', () => {
  let controller: TextController;
  let service: TextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextController],
      providers: [
        {
          provide: TextService,
          useValue: {
            createText: jest.fn(),
            updateText: jest.fn(),
            deleteText: jest.fn(),
            getTextById: jest.fn(),
            getAllTexts: jest.fn(),
            getByFilters: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TextController>(TextController);
    service = module.get<TextService>(TextService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createText', () => {
    it('should call TextService.createText with correct parameters', async () => {
      const createTextDto: CreateTextDto = {
        title: 'Test Title',
        content: 'Test Content',
        difficultyId: 1,
        typeId: 2,
        languageId: 3,
      };
      const mockRequest = {
        user: { id: 1, email: 'test@example.com', role: UserRole.ADMIN },
      } as unknown as Request;
      const result = {
        success: true,
        message: 'Texto creado exitosamente',
        data: {
          id: 1,
          title: 'Test Title',
          content: 'Test Content',
          difficultyId: 1,
          typeId: 2,
          languageId: 3,
          difficulty: {
            id: 1,
            name: 'Easy',
            isActive: true,
            createdAt: new Date(),
            description: null,
            orderIndex: 1,
          },
          type: {
            id: 2,
            name: 'Code',
            isActive: true,
            createdAt: new Date(),
            description: null,
          },
          language: { id: 3, name: 'JavaScript' },
          createdBy: { id: 1, username: 'admin', email: 'admin@example.com' },
          isActive: true,
          createdAt: new Date(),
          createdById: 1,
        },
      };

      const createTextSpy = jest
        .spyOn(service, 'createText')
        .mockResolvedValue(result as any);

      const response = await controller.createText(createTextDto, mockRequest);

      expect(createTextSpy).toHaveBeenCalledWith(createTextDto, 1);
      expect(response).toEqual(result);
    });
  });

  describe('updateText', () => {
    it('should call TextService.updateText with correct parameters', async () => {
      const updateTextDto: UpdateTextDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        difficultyId: 1,
        typeId: 2,
        languageId: 3,
      };
      const result = {
        success: true,
        message: 'Texto actualizado exitosamente',
        data: {
          id: 1,
          title: 'Updated Title',
          content: 'Updated Content',
          difficultyId: 1,
          typeId: 2,
          languageId: 3,
          difficulty: {
            id: 1,
            name: 'Easy',
            isActive: true,
            createdAt: new Date(),
            description: null,
            orderIndex: 1,
          },
          type: {
            id: 2,
            name: 'Code',
            isActive: true,
            createdAt: new Date(),
            description: null,
          },
          language: { id: 3, name: 'JavaScript' },
          createdBy: { id: 1, username: 'admin', email: 'admin@example.com' },
          isActive: true,
          createdAt: new Date(),
          createdById: 1,
        },
      };

      const updateTextSpy = jest
        .spyOn(service, 'updateText')
        .mockResolvedValue(result as any);

      const response = await controller.updateText(1, updateTextDto);

      expect(updateTextSpy).toHaveBeenCalledWith(1, updateTextDto);
      expect(response).toEqual(result);
    });
  });

  describe('deleteText', () => {
    it('should call TextService.deleteText with correct parameters', async () => {
      const result = { success: true, message: 'Texto eliminado exitosamente' };

      const deleteTextSpy = jest
        .spyOn(service, 'deleteText')
        .mockResolvedValue(result);

      const response = await controller.deleteText(1);

      expect(deleteTextSpy).toHaveBeenCalledWith(1);
      expect(response).toEqual(result);
    });
  });

  describe('getTextById', () => {
    it('should call TextService.getTextById with correct parameters', async () => {
      const result = {
        success: true,
        data: { id: 1, title: 'Test Title', content: 'Test Content' },
      };

      const getTextByIdSpy = jest
        .spyOn(service, 'getTextById')
        .mockResolvedValue(result as any);

      const response = await controller.getTextById(1);

      expect(getTextByIdSpy).toHaveBeenCalledWith(1);
      expect(response).toEqual(result);
    });
  });

  describe('getAllTexts', () => {
    it('should call TextService.getAllTexts with correct parameters', async () => {
      const paginationDto: PaginationTextDto = { page: 1, limit: 10 };
      const result = {
        success: true,
        data: {
          items: [],
          meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
        },
      };

      const getAllTextsSpy = jest
        .spyOn(service, 'getAllTexts')
        .mockResolvedValue(result);

      const response = await controller.getAllTexts(paginationDto);

      expect(getAllTextsSpy).toHaveBeenCalledWith(paginationDto);
      expect(response).toEqual(result);
    });
  });

  describe('getByFilters', () => {
    it('should call TextService.getByFilters with correct parameters', async () => {
      const filterTextDto: FilterTextDto = { title: 'Test' };
      const paginationDto: PaginationTextDto = { page: 1, limit: 10 };
      const result = {
        success: true,
        data: {
          items: [],
          meta: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
        },
      };

      const getByFiltersSpy = jest
        .spyOn(service, 'getByFilters')
        .mockResolvedValue(result);

      const response = await controller.getByFilters(
        filterTextDto,
        paginationDto,
      );

      expect(getByFiltersSpy).toHaveBeenCalledWith(
        filterTextDto,
        paginationDto,
      );
      expect(response).toEqual(result);
    });
  });
});
