import { Logger } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getAppInfo } from './app-info';

export interface FaultConfig {
    enabled: boolean;
    errorRate: number;
    latencyMs: number;
}

const MAX_LATENCY_MS = 5000;

const clamp = (value: number, min: number, max: number) =>
    Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min;

// Fault injection exists only to simulate a bad canary release in a controlled
// demo. It is inert unless the image was built for the canary track AND the
// revision was deployed with FAULT_ERROR_RATE / FAULT_LATENCY_MS. There is no
// endpoint to toggle it: changing it means deploying a new revision.
export function resolveFaultConfig(env: NodeJS.ProcessEnv, track: string): FaultConfig {
    const errorRate = clamp(Number(env.FAULT_ERROR_RATE ?? 0), 0, 1);
    const latencyMs = clamp(Number(env.FAULT_LATENCY_MS ?? 0), 0, MAX_LATENCY_MS);
    const enabled = track === 'canary' && (errorRate > 0 || latencyMs > 0);
    return enabled
        ? { enabled, errorRate, latencyMs }
        : { enabled: false, errorRate: 0, latencyMs: 0 };
}

export function registerFaultInjection(app: NestFastifyApplication) {
    const config = resolveFaultConfig(process.env, getAppInfo().track);
    if (!config.enabled) return;

    new Logger('FaultInjection').warn(
        `ACTIVE on this canary revision: errorRate=${config.errorRate}, latencyMs=${config.latencyMs}`,
    );

    app
        .getHttpAdapter()
        .getInstance()
        .addHook('onRequest', async (request, reply) => {
            const path = request.url.split('?')[0];
            if (path.endsWith('/health')) return; // never fail liveness checks

            if (config.latencyMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, config.latencyMs));
            }
            if (config.errorRate > 0 && Math.random() < config.errorRate) {
                return reply.code(500).send({
                    statusCode: 500,
                    timestamp: new Date().toISOString(),
                    path,
                    message: 'Injected fault (canary)',
                });
            }
        });
}