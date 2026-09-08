import { Controller, Get } from '@nestjs/common';

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