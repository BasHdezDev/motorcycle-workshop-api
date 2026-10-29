import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getAppInfo } from '../../common/app-info';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('v4-health')
@Controller('api/v4/health')
export class HealthV4Controller {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async check() {
        const { version, track } = getAppInfo();
        const body = {
            apiVersion: 'v4',
            appVersion: version,
            track,
            timestamp: new Date().toISOString(),
        };
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'ok', database: 'up', ...body };
        } catch {
            throw new HttpException(
                { status: 'error', database: 'down', ...body },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}