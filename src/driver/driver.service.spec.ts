import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client.js';

describe('DriverService', () => {
  let service: DriverService;

  const mockPrismaService = {
    driver: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DriverService>(DriverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      firstName: 'Juan',
      lastName: 'Perez',
      documentNumber: '123456',
      phone: '3001234567',
      email: 'juan@test.com',
    };

    it('should create and return a driver', async () => {
      const expected = { id: 'uuid-1', ...dto };
      mockPrismaService.driver.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrismaService.driver.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should throw ConflictException on unique constraint violation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.9.1',
          meta: { target: ['documentNumber'] },
        },
      );
      mockPrismaService.driver.create.mockRejectedValue(prismaError);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should rethrow unexpected errors', async () => {
      const unexpectedError = new Error('Something went wrong');
      mockPrismaService.driver.create.mockRejectedValue(unexpectedError);

      await expect(service.create(dto)).rejects.toThrow(unexpectedError);
    });
  });

  describe('findAll', () => {
    it('should return an array of drivers', async () => {
      const expected = [{ id: 'uuid-1' }, { id: 'uuid-2' }];
      mockPrismaService.driver.findMany.mockResolvedValue(expected);

      const result = await service.findAll();

      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a driver when found', async () => {
      const expected = { id: 'uuid-1', firstName: 'Juan' };
      mockPrismaService.driver.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(expected);
      expect(mockPrismaService.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when driver does not exist', async () => {
      mockPrismaService.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the driver', async () => {
      const existing = { id: 'uuid-1', firstName: 'Juan' };
      const updated = { ...existing, phone: '3009999999' };
      mockPrismaService.driver.findUnique.mockResolvedValue(existing);
      mockPrismaService.driver.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        phone: '3009999999',
      });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating a non-existent driver', async () => {
      mockPrismaService.driver.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { phone: '3009999999' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.driver.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on unique constraint violation', async () => {
      mockPrismaService.driver.findUnique.mockResolvedValue({ id: 'uuid-1' });
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.9.1',
          meta: { target: ['email'] },
        },
      );
      mockPrismaService.driver.update.mockRejectedValue(prismaError);

      await expect(
        service.update('uuid-1', { email: 'taken@test.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a driver with no motorcycles', async () => {
      const existing = { id: 'uuid-1', _count: { motorcycles: 0 } };
      mockPrismaService.driver.findUnique.mockResolvedValue(existing);
      mockPrismaService.driver.delete.mockResolvedValue({ id: 'uuid-1' });

      const result = await service.remove('uuid-1');

      expect(result).toEqual({ id: 'uuid-1' });
      expect(mockPrismaService.driver.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when driver does not exist', async () => {
      mockPrismaService.driver.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when driver has motorcycles', async () => {
      const existing = { id: 'uuid-1', _count: { motorcycles: 2 } };
      mockPrismaService.driver.findUnique.mockResolvedValue(existing);

      await expect(service.remove('uuid-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.driver.delete).not.toHaveBeenCalled();
    });
  });
});