import { CorrelationIdGuard } from './correlation-id.guard';

function ctx(headers: Record<string, string>) {
    const req: any = { headers };
    const reply = { header: jest.fn() };
    const c: any = {
        switchToHttp: () => ({ getRequest: () => req, getResponse: () => reply }),
    };
    return { c, req, reply };
}

describe('CorrelationIdGuard', () => {
    const guard = new CorrelationIdGuard();

    it('keeps the incoming x-correlation-id and echoes it', () => {
        const { c, req, reply } = ctx({ 'x-correlation-id': 'abc-123' });
        expect(guard.canActivate(c)).toBe(true);
        expect(req.correlationId).toBe('abc-123');
        expect(reply.header).toHaveBeenCalledWith('x-correlation-id', 'abc-123');
    });

    it('generates a UUID when the header is missing', () => {
        const { c, req } = ctx({});
        guard.canActivate(c);
        expect(req.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('replaces an unsafe id with a generated one', () => {
        const { c, req } = ctx({ 'x-correlation-id': 'bad id\nwith newline' });
        guard.canActivate(c);
        expect(req.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('reuses the id the request context already set', () => {
        const { c, req, reply } = ctx({ 'x-correlation-id': 'from-header' });
        req.correlationId = 'from-context';
        guard.canActivate(c);
        expect(req.correlationId).toBe('from-context');
        expect(reply.header).toHaveBeenCalledWith('x-correlation-id', 'from-context');
    });
});