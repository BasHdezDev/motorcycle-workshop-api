import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { trace } from '@opentelemetry/api';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyRequest } from 'fastify';

const SAFE_ID = /^[\w.-]{1,128}$/;

export const requestContext = new AsyncLocalStorage<{ correlationId: string }>();

export function resolveCorrelationId(header: unknown): string {
    return typeof header === 'string' && SAFE_ID.test(header) ? header : randomUUID();
}

/**
 * Gives every request a correlation id (the caller's x-correlation-id, or a new UUID)
 * and keeps it available to the logger for the whole request. When tracing is on,
 * the id is also stamped on the active span.
 */
export function registerRequestContext(app: NestFastifyApplication) {
    const fastify = app.getHttpAdapter().getInstance();

    fastify.addHook('onRequest', (req, _reply, done) => {
        const correlationId = resolveCorrelationId(req.headers['x-correlation-id']);
        (req as FastifyRequest & { correlationId?: string }).correlationId = correlationId;
        trace.getActiveSpan()?.setAttribute('app.correlation_id', correlationId);
        requestContext.run({ correlationId }, done);
    });
}