import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client.js';

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  const mockPrismaService = {
    motorcycle: { findUnique: jest.fn() },
    serviceOrder: {
      findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(),
      create: jest.fn(), update: jest.fn(),
    },
  };
  const dto = {
    orderNumber: 'SO-001', motorcycleId: 'motorcycle-1',
    checkInDate: '2026-08-18T10:00:00.000Z', problemDescription: 'Noise',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceOrderService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();
    service = module.get<ServiceOrderService>(ServiceOrderService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('create', () => {
    beforeEach(() => {
      mockPrismaService.motorcycle.findUnique.mockResolvedValue({ id: dto.motorcycleId });
      mockPrismaService.serviceOrder.findFirst.mockResolvedValue(null);
    });

    it('should create an order for an existing motorcycle without an active order', async () => {
      const expected = { id: 'order-1', ...dto, status: 'RECEIVED' };
      mockPrismaService.serviceOrder.create.mockResolvedValue(expected);
      await expect(service.create(dto)).resolves.toEqual(expected);
      expect(mockPrismaService.serviceOrder.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should reject a missing motorcycle or active order', async () => {
      mockPrismaService.motorcycle.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      mockPrismaService.motorcycle.findUnique.mockResolvedValue({ id: dto.motorcycleId });
      mockPrismaService.serviceOrder.findFirst.mockResolvedValue({ orderNumber: 'SO-000' });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should map duplicate order numbers to ConflictException', async () => {
      mockPrismaService.serviceOrder.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002', clientVersion: '7.9.1', meta: { target: ['orderNumber'] },
      }));
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  it('should find all orders and search with filters', async () => {
    mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
    await expect(service.findAll()).resolves.toEqual([]);
    await service.search({ motorcycleId: 'motorcycle-1', status: 'RECEIVED' });
    expect(mockPrismaService.serviceOrder.findMany).toHaveBeenLastCalledWith({
      where: { motorcycleId: 'motorcycle-1', status: 'RECEIVED' },
    });
  });

  describe('update', () => {
    it('should update a non-terminal order', async () => {
      const order = { id: 'order-1', status: 'UNDER_REPAIR' };
      const update = { repairCost: 100 };
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(order);
      mockPrismaService.serviceOrder.update.mockResolvedValue({ ...order, ...update });
      await expect(service.update(order.id, update)).resolves.toEqual({ ...order, ...update });
    });

    it('should reject updates to terminal orders', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue({ id: 'order-1', status: 'DELIVERED' });
      await expect(service.update('order-1', { repairCost: 100 })).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.serviceOrder.update).not.toHaveBeenCalled();
    });
  });

  describe('changeStatus and cancel', () => {
    it('should transition status and set checkout date on delivery', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue({ id: 'order-1', status: 'READY', repairCost: 100, paymentCompleted: true });
      mockPrismaService.serviceOrder.update.mockResolvedValue({ id: 'order-1', status: 'DELIVERED' });
      await service.changeStatus('order-1', { status: 'DELIVERED' });
      expect(mockPrismaService.serviceOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-1' }, data: expect.objectContaining({ status: 'DELIVERED', checkOutDate: expect.any(Date) }),
      }));
    });

    it('should reject invalid transitions and delivery without payment', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue({ id: 'order-1', status: 'RECEIVED' });
      await expect(service.changeStatus('order-1', { status: 'READY' })).rejects.toThrow(BadRequestException);
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue({ id: 'order-1', status: 'READY', repairCost: 100, paymentCompleted: false });
      await expect(service.changeStatus('order-1', { status: 'DELIVERED' })).rejects.toThrow(BadRequestException);
    });

    it('should cancel only cancellable orders', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue({ id: 'order-1', status: 'RECEIVED' });
      mockPrismaService.serviceOrder.update.mockResolvedValue({ id: 'order-1', status: 'CANCELLED' });
      await expect(service.cancel('order-1')).resolves.toEqual({ id: 'order-1', status: 'CANCELLED' });
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue({ id: 'order-1', status: 'UNDER_REPAIR' });
      await expect(service.cancel('order-1')).rejects.toThrow(BadRequestException);
    });
  });
});