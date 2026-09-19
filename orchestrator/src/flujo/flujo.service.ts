import { Injectable, Logger } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';
import { randomUUID } from 'crypto';
import { resolveTarget } from '../config/api-targets';
import { FlujoRequestDto } from './dto/flujo-request.dto';

@Injectable()
export class FlujoService {
    private readonly logger = new Logger(FlujoService.name);
    private readonly pubsub = new PubSub({
        projectId: process.env.PUBSUB_PROJECT_ID,
    });

    async ejecutar(dto: FlujoRequestDto, incomingTraceId: string | undefined) {
        const traceId = incomingTraceId ?? randomUUID();
        const correlationId = randomUUID();

        this.logger.log(`[${correlationId}] Iniciando flujo, traceId=${traceId}, action=${dto.action}`);

        // 1. Llamada a API B (orders)
        const apiBResult = await this.callApiB(dto.orderId, correlationId);

        // 2. Llamada a API A (inventory)
        const apiAResult = await this.callApi('inventory', correlationId);

        // 3. Publicar a Pub/Sub (parte asíncrona)
        const messageId = await this.publishToPubSub({
            traceId,
            correlationId,
            action: dto.action,
            apiBStatus: apiBResult.status,
            apiAStatus: apiAResult.status,
            timestamp: new Date().toISOString(),
        });

        this.logger.log(`[${correlationId}] Flujo completado, pubsubMessageId=${messageId}`);

        return {
            traceId,
            correlationId,
            apiB: apiBResult,
            apiA: apiAResult,
            pubsub: { published: true, messageId },
        };
    }

    private async callApiB(orderId: string | undefined, correlationId: string) {
        if (!orderId) return { status: 'skipped', reason: 'no orderId provided' };

        try {
            const response = await fetch(`${process.env.API_B_URL}/api/v2/service-orders/${orderId}`, {
                headers: {
                    'x-api-key': process.env.API_B_KEY!,
                    'x-correlation-id': correlationId,
                },
            });
            if (!response.ok) return { status: 'error', httpStatus: response.status };
            return { status: 'ok', data: await response.json() };
        } catch (error) {
            return { status: 'error', message: String(error) };
        }
    }

    private async callApi(api: string, correlationId: string) {
        const target = resolveTarget(api);
        if (!target) return { status: 'error', message: 'unknown api' };

        try {
            const response = await fetch(`${target.baseUrl}${target.randomPath}`, {
                headers: {
                    'x-api-key': target.apiKey,
                    'x-correlation-id': correlationId,
                },
            });
            if (!response.ok) return { status: 'error', httpStatus: response.status };
            return { status: 'ok', data: await response.json() };
        } catch (error) {
            return { status: 'error', message: String(error) };
        }
    }

    private async publishToPubSub(payload: Record<string, unknown>): Promise<string> {
        const topic = this.pubsub.topic(process.env.PUBSUB_TOPIC!);
        const dataBuffer = Buffer.from(JSON.stringify(payload));
        return topic.publishMessage({ data: dataBuffer });
    }
}