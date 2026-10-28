import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getAppInfo } from './app-info';

// Runs before routing, so the headers are also present on 401 (guard),
// 404 (unknown route) and the custom QUERY routes.
export function registerVersionHeaders(app: NestFastifyApplication) {
  const { version, track } = getAppInfo();
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', (_request, reply, done) => {
      reply.header('X-App-Version', version);
      reply.header('X-App-Track', track);
      done();
    });
}