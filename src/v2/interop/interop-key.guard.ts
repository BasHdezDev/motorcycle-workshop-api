import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

const SAFE_ID = /^[\w.-]{1,128}$/;

function safeEqual(a: string, b: string): boolean {
    const A = Buffer.from(a);
    const B = Buffer.from(b);
    return A.length === B.length && timingSafeEqual(A, B);
}

@Injectable()
export class InteropKeyGuard implements CanActivate {
    private readonly logger = new Logger('InteropGuard');

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

        const expected = process.env.INTEROP_API_KEY ?? '';
        const given = req.headers['x-api-key'];
        const ok =
            expected.length > 0 &&
            typeof given === 'string' &&
            safeEqual(given, expected);

        if (!ok) {
            this.logger.warn(`interop request rejected correlationId=${correlationId}`);
            throw new UnauthorizedException();
        }
        return true;
    }
}