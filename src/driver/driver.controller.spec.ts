import { Test, TestingModule } from '@nestjs/testing';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';

describe('DriverController', () => {
  let controller: DriverController;

  const mockDriverService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverController],
      providers: [{ provide: DriverService, useValue: mockDriverService }],
    }).compile();

    controller = module.get<DriverController>(DriverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create with the dto', async () => {
    const dto = {
      firstName: 'Juan',
      lastName: 'Perez',
      documentNumber: '123456',
      phone: '3001234567',
    };
    mockDriverService.create.mockResolvedValue({ id: 'uuid-1', ...dto });

    const result = await controller.create(dto as any);

    expect(mockDriverService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'uuid-1', ...dto });
  });

  it('findAll should call service.findAll with pagination params', async () => {
    const paginatedResult = {
      data: [{ id: 'uuid-1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    mockDriverService.findAll.mockResolvedValue(paginatedResult);

    const result = await controller.findAll({ page: 1, limit: 10 });

    expect(mockDriverService.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginatedResult);
  });

  it('findOne should call service.findOne with the id', async () => {
    mockDriverService.findOne.mockResolvedValue({ id: 'uuid-1' });

    const result = await controller.findOne('uuid-1');

    expect(mockDriverService.findOne).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual({ id: 'uuid-1' });
  });

  it('update should call service.update with id and dto', async () => {
    const dto = { phone: '3009999999' };
    mockDriverService.update.mockResolvedValue({ id: 'uuid-1', ...dto });

    const result = await controller.update('uuid-1', dto as any);

    expect(mockDriverService.update).toHaveBeenCalledWith('uuid-1', dto);
    expect(result).toEqual({ id: 'uuid-1', ...dto });
  });

  it('remove should call service.remove with the id', async () => {
    mockDriverService.remove.mockResolvedValue({ id: 'uuid-1' });

    const result = await controller.remove('uuid-1');

    expect(mockDriverService.remove).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual({ id: 'uuid-1' });
  });
});