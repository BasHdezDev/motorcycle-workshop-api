import { NotFoundException } from '@nestjs/common';
import { InteropOrdersController } from './interop-orders.controller';

describe('InteropOrdersController', () => {
    const req: any = { correlationId: 'cid-1' };

    it('returns the order from the service', async () => {
        const order = { source: 'workshop-orders-api', id: '1' };
        const service: any = { randomForInterop: jest.fn().mockResolvedValue(order) };
        const controller = new InteropOrdersController(service);

        await expect(controller.random(req)).resolves.toBe(order);
        expect(service.randomForInterop).toHaveBeenCalledWith('cid-1');
    });

    it('throws 404 when there are no orders', async () => {
        const service: any = { randomForInterop: jest.fn().mockResolvedValue(null) };
        const controller = new InteropOrdersController(service);

        await expect(controller.random(req)).rejects.toThrow(NotFoundException);
    });
});