import { LoggerService } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { requestContext } from './request-context';

type Level = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';

const SEVERITY: Record<Level, string> = {
    log: 'INFO', error: 'ERROR', warn: 'WARNING',
    debug: 'DEBUG', verbose: 'DEBUG', fatal: 'CRITICAL',
};

const isStack = (value: unknown): value is string =>
    typeof value === 'string' && value.includes('\n    at ');

/** One JSON object per line on stdout; Cloud Logging reads `severity` and `message`. */
export class JsonLogger implements LoggerService {
    log(message: unknown, ...params: unknown[]) { this.write('log', message, params); }
    error(message: unknown, ...params: unknown[]) { this.write('error', message, params); }
    warn(message: unknown, ...params: unknown[]) { this.write('warn', message, params); }
    debug(message: unknown, ...params: unknown[]) { this.write('debug', message, params); }
    verbose(message: unknown, ...params: unknown[]) { this.write('verbose', message, params); }
    fatal(message: unknown, ...params: unknown[]) { this.write('fatal', message, params); }

    private write(level: Level, message: unknown, params: unknown[]) {
        const last = params[params.length - 1];
        const context = typeof last === 'string' && !isStack(last) ? last : undefined;
        const stack = message instanceof Error ? message.stack : params.find(isStack);

        const spanContext = trace.getActiveSpan()?.spanContext();
        const line = {
            severity: SEVERITY[level],
            timestamp: new Date().toISOString(),
            context,
            message: this.text(message),
            correlationId: requestContext.getStore()?.correlationId,
            traceId: spanContext?.traceId,
            spanId: spanContext?.spanId,
            stack,
        };
        process.stdout.write(JSON.stringify(line) + '\n');
    }

    private text(message: unknown): string {
        if (typeof message === 'string') return message;
        if (message instanceof Error) return message.message;
        try {
            return JSON.stringify(message);
        } catch {
            return String(message);
        }
    }
}