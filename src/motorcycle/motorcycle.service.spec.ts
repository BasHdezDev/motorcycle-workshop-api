import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MotorcycleService } from './motorcycle.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client.js';

describe('MotorcycleService', () => {
    let service: MotorcycleService;

    const mockPrismaService = {
        driver: { findUnique: jest.fn() },
        motorcycle: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };

    const dto = {
        licensePlate: 'ABC123', brand: 'Honda', model: 'CB190R', year: 2024,
        engineDisplacement: 184, color: 'Black', chassisNumber: 'CHASSIS-1',
        engineNumber: 'ENGINE-1', driverId: 'driver-1',
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [MotorcycleService, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();
        service = module.get<MotorcycleService>(MotorcycleService);
    });

    it('should be defined', () => expect(service).toBeDefined());

    describe('create', () => {
        it('should require an existing driver and create the motorcycle', async () => {
            const expected = { id: 'motorcycle-1', ...dto };
            mockPrismaService.driver.findUnique.mockResolvedValue({ id: dto.driverId });
            mockPrismaService.motorcycle.create.mockResolvedValue(expected);

            await expect(service.create(dto)).resolves.toEqual(expected);
            expect(mockPrismaService.motorcycle.create).toHaveBeenCalledWith({ data: dto });
        });

        it('should throw when the driver does not exist', async () => {
            mockPrismaService.driver.findUnique.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
            expect(mockPrismaService.motorcycle.create).not.toHaveBeenCalled();
        });

        it('should map duplicate fields to ConflictException', async () => {
            mockPrismaService.driver.findUnique.mockResolvedValue({ id: dto.driverId });
            mockPrismaService.motorcycle.create.mockRejectedValue(
                new Prisma.PrismaClientKnownRequestError('duplicate', {
                    code: 'P2002', clientVersion: '7.9.1', meta: { target: ['licensePlate'] },
                }),
            );

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('read and search', () => {
        it('should return paginated motorcycles', async () => {
            const motorcycles = [{ id: 'uuid-1' }, { id: 'uuid-2' }];
            mockPrismaService.motorcycle.findMany.mockResolvedValue(motorcycles);
            mockPrismaService.motorcycle.count.mockResolvedValue(2);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.data).toEqual(motorcycles);
            expect(result.meta).toEqual({
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
            expect(mockPrismaService.motorcycle.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
            });
        });

        it('should return one motorcycle or throw when absent', async () => {
            const expected = { id: 'motorcycle-1' };
            mockPrismaService.motorcycle.findUnique.mockResolvedValueOnce(expected).mockResolvedValueOnce(null);
            await expect(service.findOne(expected.id)).resolves.toEqual(expected);
            await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
        });

        it('should apply provided search filters', async () => {
            mockPrismaService.motorcycle.findMany.mockResolvedValue([]);
            await service.search({ brand: 'honda', year: 2024, driverId: 'driver-1' });
            expect(mockPrismaService.motorcycle.findMany).toHaveBeenCalledWith({
                where: {
                    brand: { contains: 'honda', mode: 'insensitive' }, year: 2024, driverId: 'driver-1',
                },
            });
        });
    });

    describe('update', () => {
        it('should update an existing motorcycle', async () => {
            const update = { color: 'Red' };
            const expected = { id: 'motorcycle-1', ...update };
            mockPrismaService.motorcycle.findUnique.mockResolvedValue({ id: expected.id });
            mockPrismaService.motorcycle.update.mockResolvedValue(expected);
            await expect(service.update(expected.id, update)).resolves.toEqual(expected);
            expect(mockPrismaService.motorcycle.update).toHaveBeenCalledWith({ where: { id: expected.id }, data: update });
        });

        it('should not update a missing motorcycle', async () => {
            mockPrismaService.motorcycle.findUnique.mockResolvedValue(null);
            await expect(service.update('missing', { color: 'Red' })).rejects.toThrow(NotFoundException);
            expect(mockPrismaService.motorcycle.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should delete a motorcycle without service orders', async () => {
            mockPrismaService.motorcycle.findUnique.mockResolvedValue({ id: 'motorcycle-1', _count: { serviceOrders: 0 } });
            mockPrismaService.motorcycle.delete.mockResolvedValue({ id: 'motorcycle-1' });
            await expect(service.remove('motorcycle-1')).resolves.toEqual({ id: 'motorcycle-1' });
        });

        it('should reject deletion when service orders exist', async () => {
            mockPrismaService.motorcycle.findUnique.mockResolvedValue({ id: 'motorcycle-1', _count: { serviceOrders: 1 } });
            await expect(service.remove('motorcycle-1')).rejects.toThrow(ConflictException);
            expect(mockPrismaService.motorcycle.delete).not.toHaveBeenCalled();
        });
    });
});