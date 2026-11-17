import { trace } from '@opentelemetry/api';
import { JsonLogger } from './json-logger';
import { requestContext } from './request-context';

describe('JsonLogger', () => {
    const logger = new JsonLogger();
    let out: string[];

    beforeEach(() => {
        out = [];
        jest.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
            out.push(String(chunk));
            return true;
        });
    });
    afterEach(() => jest.restoreAllMocks());

    const last = () => JSON.parse(out[out.length - 1]);

    it('writes one JSON line with severity, message, context and timestamp', () => {
        logger.log('hello', 'Ctx');
        expect(out).toHaveLength(1);
        expect(last()).toMatchObject({ severity: 'INFO', message: 'hello', context: 'Ctx' });
        expect(Number.isNaN(Date.parse(last().timestamp))).toBe(false);
    });

    it('adds the correlation id inside a request and omits it outside', () => {
        logger.log('outside');
        expect(last()).not.toHaveProperty('correlationId');

        requestContext.run({ correlationId: 'abc-1' }, () => logger.log('inside'));
        expect(last().correlationId).toBe('abc-1');
    });

    it('adds traceId and spanId from the active span', () => {
        jest.spyOn(trace, 'getActiveSpan').mockReturnValue({
            spanContext: () => ({ traceId: 'a'.repeat(32), spanId: 'b'.repeat(16), traceFlags: 1 }),
        } as any);
        logger.warn('traced');
        expect(last()).toMatchObject({ severity: 'WARNING', traceId: 'a'.repeat(32), spanId: 'b'.repeat(16) });
    });

    it('has no trace fields when tracing is off', () => {
        logger.log('plain');
        expect(last()).not.toHaveProperty('traceId');
    });

    it('keeps the stack of an error and maps the severity', () => {
        logger.error('boom', 'Error: boom\n    at somewhere (file.ts:1:1)', 'Ctx');
        expect(last()).toMatchObject({ severity: 'ERROR', message: 'boom', context: 'Ctx' });
        expect(last().stack).toContain('at somewhere');
    });

    it('does not throw on a circular object', () => {
        const a: any = {};
        a.self = a;
        expect(() => logger.log(a)).not.toThrow();
        expect(out).toHaveLength(1);
    });
});