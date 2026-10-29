import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('v2-health')
@Controller('api/v2/health')
export class HealthV2Controller {
    @Get()
    check() {
        return {
            status: 'ok',
            version: 'v2',
            timestamp: new Date().toISOString(),
        };
    }
}