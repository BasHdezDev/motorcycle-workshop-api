import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
    let controller: HealthController;

    const mockPrismaService = {
        $queryRaw: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [{ provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return ok status when database is reachable', async () => {
        mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

        const result = await controller.check();

        expect(result.status).toBe('ok');
        expect(result.database).toBe('up');
        expect(result.version).toBeDefined();
        expect(result.timestamp).toBeDefined();
    });

    it('should throw HttpException with 503 when database is unreachable', async () => {
        mockPrismaService.$queryRaw.mockRejectedValue(
            new Error('Connection refused'),
        );

        let error: unknown;
        try {
            await controller.check();
        } catch (caughtError) {
            error = caughtError;
        }

        expect(error).toBeInstanceOf(HttpException);
        if (!(error instanceof HttpException)) return;

        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.getResponse()).toMatchObject({
            status: 'error',
            database: 'down',
        });
    });
});