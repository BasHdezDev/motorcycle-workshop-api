import { Controller, Get, Param, NotFoundException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { resolveTarget } from '../config/api-targets';

@Controller('metrics')
export class MetricsController {
    @Get(':api')
    async proxyMetrics(@Param('api') api: string, @Res() reply: Response) {
        const target = resolveTarget(api);
        if (!target) throw new NotFoundException(`Unknown api: ${api}`);

        const response = await fetch(`${target.baseUrl}${target.metricsPath}`, {
            headers: { 'x-api-key': target.apiKey },
        });

        const body = await response.text();
        reply
            .status(response.status)
            .header('content-type', 'text/plain; version=0.0.4')
            .send(body);
    }
}