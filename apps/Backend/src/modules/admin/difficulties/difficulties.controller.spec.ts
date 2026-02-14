import { Test, TestingModule } from '@nestjs/testing';
import { DifficultiesController } from './difficulties.controller';
import { DifficultiesAdminService } from './difficulties.service';

describe('DifficultiesController', () => {
  let controller: DifficultiesController;

  const mockDifficultiesService = {
    createDifficulty: jest.fn(),
    updateDifficulty: jest.fn(),
    getDifficulties: jest.fn(),
    getDifficultyById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DifficultiesController],
      providers: [
        {
          provide: DifficultiesAdminService,
          useValue: mockDifficultiesService,
        },
      ],
    }).compile();

    controller = module.get<DifficultiesController>(DifficultiesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDifficulty', () => {
    it('should create a difficulty successfully', async () => {
      const createDto = {
        name: 'easy',
        description: 'Easy level',
        orderIndex: 1,
      };
      const expectedResult = {
        id: 1,
        name: 'easy',
        description: 'Easy level',
      };

      mockDifficultiesService.createDifficulty.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.createDifficulty(createDto);

      expect(mockDifficultiesService.createDifficulty).toHaveBeenCalledWith(
        createDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateDifficulty', () => {
    it('should update a difficulty successfully', async () => {
      const updateDto = {
        name: 'medium',
        description: 'Medium level',
        orderIndex: 2,
      };
      const id = '1';
      const expectedResult = {
        id: 1,
        name: 'medium',
        description: 'Medium level',
      };

      mockDifficultiesService.updateDifficulty.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.updateDifficulty(id, updateDto);

      expect(mockDifficultiesService.updateDifficulty).toHaveBeenCalledWith(
        Number(id),
        updateDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getDifficulties', () => {
    it('should return paginated difficulties', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [
          { id: 1, name: 'easy', description: 'Easy level', orderIndex: 1 },
          { id: 2, name: 'medium', description: 'Medium level', orderIndex: 2 },
        ],
        total: 2,
        page: 1,
        lastPage: 1,
      };

      mockDifficultiesService.getDifficulties.mockResolvedValue(expectedResult);

      const result = await controller.getDifficulties(paginationDto);

      expect(mockDifficultiesService.getDifficulties).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getDifficultyById', () => {
    it('should return a difficulty by id', async () => {
      const id = '1';
      const expectedResult = {
        id: 1,
        name: 'easy',
        description: 'Easy level',
        isActive: true,
      };

      mockDifficultiesService.getDifficultyById.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getDifficultyById(id);

      expect(mockDifficultiesService.getDifficultyById).toHaveBeenCalledWith(
        Number(id),
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
