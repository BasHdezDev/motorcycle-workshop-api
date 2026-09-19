import { Controller, Get, Param, Headers, NotFoundException, UseGuards, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { resolveTarget } from '../config/api-targets';
import { ApiKeyGuard } from '../common/api-key.guard';

@Controller('interop')
@UseGuards(ApiKeyGuard)
export class InteropController {
    @Get(':api/random')
    async proxyRandom(
        @Param('api') api: string,
        @Headers('x-correlation-id') incomingCorrelationId: string | undefined,
        @Res() reply: FastifyReply,
    ) {
        const target = resolveTarget(api);
        if (!target) throw new NotFoundException(`Unknown api: ${api}`);

        const correlationId = incomingCorrelationId ?? randomUUID();

        try {
            const response = await fetch(`${target.baseUrl}${target.randomPath}`, {
                headers: {
                    'x-api-key': target.apiKey,
                    'x-correlation-id': correlationId,
                },
            });

            const body = await response.text();
            reply
                .status(response.status)
                .header('x-correlation-id', correlationId)
                .header('content-type', 'application/json')
                .send(body);
        } catch (error) {
            reply
                .status(502)
                .header('x-correlation-id', correlationId)
                .send({ message: 'Failed to reach partner API', error: String(error) });
        }
    }
}