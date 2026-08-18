import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto/create-driver.dto';
import { Prisma } from '../../generated/prisma/client.js';
import { NotFoundException } from '@nestjs/common';
import { UpdateDriverDto } from './dto/update-driver.dto/update-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto/query-driver.dto';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateDriverDto) {
    try {
      return await this.prisma.driver.create({ data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const field = (error.meta?.target as string[])?.join(', ');
        throw new ConflictException(`${field} already in use`);
      }
      throw error;
    }
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.findOne(id); // 404 si no existe
    try {
      return await this.prisma.driver.update({ where: { id }, data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const field = (error.meta?.target as string[])?.join(', ');
        throw new ConflictException(`${field} already in use`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { _count: { select: { motorcycles: true } } },
    });

    if (!driver) throw new NotFoundException(`Driver ${id} not found`);

    if (driver._count.motorcycles > 0) {
      throw new ConflictException(
        `Cannot delete driver with ${driver._count.motorcycles} registered motorcycle(s)`,
      );
    }

    return this.prisma.driver.delete({ where: { id } });
  }

  findAll() {
    return this.prisma.driver.findMany();
  }

  search(filters: QueryDriverDto) {
    const where: Prisma.DriverWhereInput = {};

    if (filters.firstName) {
      where.firstName = { contains: filters.firstName, mode: 'insensitive' };
    }
    if (filters.lastName) {
      where.lastName = { contains: filters.lastName, mode: 'insensitive' };
    }
    if (filters.documentNumber) {
      where.documentNumber = { contains: filters.documentNumber };
    }
    if (filters.phone) {
      where.phone = { contains: filters.phone };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    return this.prisma.driver.findMany({ where });
  }
}