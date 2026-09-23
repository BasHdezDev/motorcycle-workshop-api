import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const interopCallsCounter = makeCounterProvider({
    name: 'interop_calls_total',
    help: 'Total calls proxied through /interop/:api/random',
    labelNames: ['api', 'outcome'],
});

@Module({
    imports: [PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } })],
    providers: [interopCallsCounter],
    exports: [interopCallsCounter],
})
export class MetricsModule { }