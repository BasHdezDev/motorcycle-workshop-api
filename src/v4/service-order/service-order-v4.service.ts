import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client.js';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { QueryServiceOrderV4Dto } from './dto/service-order-v4.dto';

@Injectable()
export class ServiceOrderV4Service {
    constructor(private readonly prisma: PrismaService) { }

    // v4 lists the most urgent orders first (enum order: LOW < ... < URGENT),
    // then the oldest check-in. Optional filter by priority.
    async findAll(query: QueryServiceOrderV4Dto): Promise<PaginatedResult<any>> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const where: Prisma.ServiceOrderWhereInput = query.priority
            ? { priority: query.priority }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.serviceOrder.findMany({
                where,
                orderBy: [{ priority: 'desc' }, { checkInDate: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.serviceOrder.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}