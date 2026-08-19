import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto/create-motorcycle.dto';
import { Prisma } from '../../generated/prisma/client.js';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto/update-motorcycle.dto';
import { QueryMotorcycleDto } from './dto/query-motorcycle.dto/query-motorcycle.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class MotorcycleService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateMotorcycleDto) {
        const driver = await this.prisma.driver.findUnique({
            where: { id: dto.driverId },
        });
        if (!driver) {
            throw new NotFoundException(`Driver ${dto.driverId} not found`);
        }

        try {
            return await this.prisma.motorcycle.create({ data: dto });
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

    async findAll(pagination: PaginationQueryDto): Promise<PaginatedResult<any>> {
        const page = pagination.page ?? 1;
        const limit = pagination.limit ?? 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.motorcycle.findMany({ skip, take: limit }),
            this.prisma.motorcycle.count(),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const motorcycle = await this.prisma.motorcycle.findUnique({
            where: { id },
        });
        if (!motorcycle) {
            throw new NotFoundException(`Motorcycle ${id} not found`);
        }
        return motorcycle;
    }

    async update(id: string, dto: UpdateMotorcycleDto) {
        await this.findOne(id);
        try {
            return await this.prisma.motorcycle.update({
                where: { id },
                data: dto,
            });
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
        const motorcycle = await this.prisma.motorcycle.findUnique({
            where: { id },
            include: { _count: { select: { serviceOrders: true } } },
        });

        if (!motorcycle) {
            throw new NotFoundException(`Motorcycle ${id} not found`);
        }

        if (motorcycle._count.serviceOrders > 0) {
            throw new ConflictException(
                `Cannot delete motorcycle with ${motorcycle._count.serviceOrders} associated service order(s)`,
            );
        }

        return this.prisma.motorcycle.delete({ where: { id } });
    }

    search(filters: QueryMotorcycleDto) {
        const where: Prisma.MotorcycleWhereInput = {};

        if (filters.licensePlate) {
            where.licensePlate = { contains: filters.licensePlate, mode: 'insensitive' };
        }
        if (filters.brand) {
            where.brand = { contains: filters.brand, mode: 'insensitive' };
        }
        if (filters.model) {
            where.model = { contains: filters.model, mode: 'insensitive' };
        }
        if (filters.year) {
            where.year = filters.year;
        }
        if (filters.driverId) {
            where.driverId = filters.driverId;
        }

        return this.prisma.motorcycle.findMany({ where });
    }
}