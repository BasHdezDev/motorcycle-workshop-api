import { Test, TestingModule } from '@nestjs/testing';
import { MotorcycleController } from './motorcycle.controller';
import { MotorcycleService } from './motorcycle.service';

describe('MotorcycleController', () => {
    let controller: MotorcycleController;

    const mockMotorcycleService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [MotorcycleController],
            providers: [
                { provide: MotorcycleService, useValue: mockMotorcycleService },
            ],
        }).compile();

        controller = module.get<MotorcycleController>(MotorcycleController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('create should call service.create with the dto', async () => {
        const dto = {
            licensePlate: 'ABC123',
            brand: 'Yamaha',
            model: 'MT-07',
            year: 2024,
            engineDisplacement: 689,
            color: 'Negro',
            chassisNumber: 'CH123',
            engineNumber: 'EN123',
            driverId: 'uuid-driver',
        };
        mockMotorcycleService.create.mockResolvedValue({ id: 'uuid-1', ...dto });

        const result = await controller.create(dto as any);

        expect(mockMotorcycleService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: 'uuid-1', ...dto });
    });

    it('findAll should call service.findAll', async () => {
        mockMotorcycleService.findAll.mockResolvedValue([{ id: 'uuid-1' }]);

        const result = await controller.findAll();

        expect(mockMotorcycleService.findAll).toHaveBeenCalled();
        expect(result).toEqual([{ id: 'uuid-1' }]);
    });

    it('findOne should call service.findOne with the id', async () => {
        mockMotorcycleService.findOne.mockResolvedValue({ id: 'uuid-1' });

        const result = await controller.findOne('uuid-1');

        expect(mockMotorcycleService.findOne).toHaveBeenCalledWith('uuid-1');
        expect(result).toEqual({ id: 'uuid-1' });
    });

    it('update should call service.update with id and dto', async () => {
        const dto = { color: 'Rojo' };
        mockMotorcycleService.update.mockResolvedValue({ id: 'uuid-1', ...dto });

        const result = await controller.update('uuid-1', dto as any);

        expect(mockMotorcycleService.update).toHaveBeenCalledWith('uuid-1', dto);
        expect(result).toEqual({ id: 'uuid-1', ...dto });
    });

    it('remove should call service.remove with the id', async () => {
        mockMotorcycleService.remove.mockResolvedValue({ id: 'uuid-1' });

        const result = await controller.remove('uuid-1');

        expect(mockMotorcycleService.remove).toHaveBeenCalledWith('uuid-1');
        expect(result).toEqual({ id: 'uuid-1' });
    });
});