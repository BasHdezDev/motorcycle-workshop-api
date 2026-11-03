import { resolveFaultConfig } from './fault-injection';

describe('resolveFaultConfig', () => {
    it('is disabled by default', () => {
        expect(resolveFaultConfig({}, 'canary').enabled).toBe(false);
    });

    it.each(['stable', 'unknown'])('ignores fault settings on the %s track', (track) => {
        const config = resolveFaultConfig({ FAULT_ERROR_RATE: '0.5', FAULT_LATENCY_MS: '300' }, track);
        expect(config).toEqual({ enabled: false, errorRate: 0, latencyMs: 0 });
    });

    it('enables faults on the canary track', () => {
        const config = resolveFaultConfig({ FAULT_ERROR_RATE: '0.3', FAULT_LATENCY_MS: '200' }, 'canary');
        expect(config).toEqual({ enabled: true, errorRate: 0.3, latencyMs: 200 });
    });

    it('clamps out-of-range values and rejects garbage', () => {
        const clamped = resolveFaultConfig({ FAULT_ERROR_RATE: '7', FAULT_LATENCY_MS: '999999' }, 'canary');
        expect(clamped).toEqual({ enabled: true, errorRate: 1, latencyMs: 5000 });
        expect(resolveFaultConfig({ FAULT_ERROR_RATE: 'abc' }, 'canary').enabled).toBe(false);
    });
});