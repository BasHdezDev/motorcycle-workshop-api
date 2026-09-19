import { Controller, Get, Param, NotFoundException, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { resolveTarget } from '../config/api-targets';

@Controller('metrics')
export class MetricsController {
    // Sin ApiKeyGuard aquí a propósito: Prometheus hace scrape periódico
    // y normalmente no manda x-api-key propio. Si quieres protegerlo igual,
    // dime y le agrego el guard.

    @Get(':api')
    async proxyMetrics(@Param('api') api: string, @Res() reply: FastifyReply) {
        const target = resolveTarget(api);
        if (!target) throw new NotFoundException(`Unknown api: ${api}`);

        const response = await fetch(`${target.baseUrl}${target.metricsPath}`, {
            headers: { 'x-api-key': target.apiKey },
        });

        const body = await response.text(); // CRÍTICO: .text(), nunca .json()
        reply
            .status(response.status)
            .header('content-type', 'text/plain; version=0.0.4')
            .send(body);
    }
}