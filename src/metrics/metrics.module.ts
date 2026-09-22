import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const partnerLookupsCounter = makeCounterProvider({
  name: 'partner_lookups_total',
  help: 'Total calls to the partner API via the Orchestrator',
  labelNames: ['outcome'],
});

@Module({
  imports: [PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } })],
  providers: [partnerLookupsCounter],
  exports: [partnerLookupsCounter],
})
export class MetricsModule {}