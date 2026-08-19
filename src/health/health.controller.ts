import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async check() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                database: 'up',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    database: 'down',
                    timestamp: new Date().toISOString(),
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}