import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

const SAFE_ID = /^[\w.-]{1,128}$/;

@Injectable()
export class CorrelationIdGuard implements CanActivate {
    private readonly logger = new Logger('Interop');

    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx
            .switchToHttp()
            .getRequest<FastifyRequest & { correlationId?: string }>();
        const reply = ctx.switchToHttp().getResponse<FastifyReply>();

        const incoming = req.headers['x-correlation-id'];
        const correlationId =
            typeof incoming === 'string' && SAFE_ID.test(incoming)
                ? incoming
                : randomUUID();
        req.correlationId = correlationId;
        reply.header('x-correlation-id', correlationId);

        this.logger.log(`interop request received correlationId=${correlationId}`);
        return true;
    }
}