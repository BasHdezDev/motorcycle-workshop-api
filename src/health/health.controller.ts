import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import * as packageJson from '../../package.json';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'Liveness check — verifies DB connectivity and reports app version' })
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