import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as packageJson from '../../package.json';

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
                version: packageJson.version,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    database: 'down',
                    version: packageJson.version,
                    timestamp: new Date().toISOString(),
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}