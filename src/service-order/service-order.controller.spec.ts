import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from './service-order.service';

describe('ServiceOrderController', () => {
    let controller: ServiceOrderController;

    const mockServiceOrderService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        changeStatus: jest.fn(),
        cancel: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceOrderController],
            providers: [
                { provide: ServiceOrderService, useValue: mockServiceOrderService },
            ],
        }).compile();

        controller = module.get<ServiceOrderController>(ServiceOrderController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('create should call service.create with the dto', async () => {
        const dto = {
            orderNumber: 'SO-0001',
            motorcycleId: 'uuid-moto',
            checkInDate: '2026-08-17T10:00:00.000Z',
            problemDescription: 'No enciende',
        };
        mockServiceOrderService.create.mockResolvedValue({ id: 'uuid-1', ...dto });

        const result = await controller.create(dto as any);

        expect(mockServiceOrderService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: 'uuid-1', ...dto });
    });

    it('findAll should call service.findAll with pagination params', async () => {
        const paginatedResult = {
            data: [{ id: 'uuid-1' }],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        };
        mockServiceOrderService.findAll.mockResolvedValue(paginatedResult);

        const result = await controller.findAll({ page: 1, limit: 10 });

        expect(mockServiceOrderService.findAll).toHaveBeenCalledWith({
            page: 1,
            limit: 10,
        });
        expect(result).toEqual(paginatedResult);
    });

    it('findOne should call service.findOne with the id', async () => {
        mockServiceOrderService.findOne.mockResolvedValue({ id: 'uuid-1' });

        const result = await controller.findOne('uuid-1');

        expect(mockServiceOrderService.findOne).toHaveBeenCalledWith('uuid-1');
        expect(result).toEqual({ id: 'uuid-1' });
    });

    it('update should call service.update with id and dto', async () => {
        const dto = { diagnosis: 'Bujía dañada' };
        mockServiceOrderService.update.mockResolvedValue({ id: 'uuid-1', ...dto });

        const result = await controller.update('uuid-1', dto as any);

        expect(mockServiceOrderService.update).toHaveBeenCalledWith('uuid-1', dto);
        expect(result).toEqual({ id: 'uuid-1', ...dto });
    });

    it('changeStatus should call service.changeStatus with id and dto', async () => {
        const dto = { status: 'UNDER_DIAGNOSIS' };
        mockServiceOrderService.changeStatus.mockResolvedValue({
            id: 'uuid-1',
            ...dto,
        });

        const result = await controller.changeStatus('uuid-1', dto as any);

        expect(mockServiceOrderService.changeStatus).toHaveBeenCalledWith(
            'uuid-1',
            dto,
        );
        expect(result).toEqual({ id: 'uuid-1', ...dto });
    });

    it('cancel should call service.cancel with the id', async () => {
        mockServiceOrderService.cancel.mockResolvedValue({
            id: 'uuid-1',
            status: 'CANCELLED',
        });

        const result = await controller.cancel('uuid-1');

        expect(mockServiceOrderService.cancel).toHaveBeenCalledWith('uuid-1');
        expect(result).toEqual({ id: 'uuid-1', status: 'CANCELLED' });
    });
});