import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DriverService } from './driver/driver.service';
import { QueryDriverDto } from './driver/dto/query-driver.dto/query-driver.dto';
import { MotorcycleService } from './motorcycle/motorcycle.service';
import { QueryMotorcycleDto } from './motorcycle/dto/query-motorcycle.dto/query-motorcycle.dto';
import { ServiceOrderService } from './service-order/service-order.service';
import { QueryServiceOrderDto } from './service-order/dto/query-service-order.dto/query-service-order.dto';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  registerQueryRoutes(app);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

// Registers the HTTP QUERY method for search/filter endpoints on each
// resource. Nest's decorator-based routing has no @Query()-method
// equivalent (its @Query() decorator is for query strings, not this HTTP
// verb), so these routes are added directly on the underlying Fastify
// instance. Because they bypass Nest's pipeline, validation is done
// manually here using the same class-validator DTOs used elsewhere.
function registerQueryRoutes(app: NestFastifyApplication) {
  const fastify = app.getHttpAdapter().getInstance();

  const driverService = app.get(DriverService);
  const motorcycleService = app.get(MotorcycleService);
  const serviceOrderService = app.get(ServiceOrderService);

  fastify.route({
    method: 'QUERY',
    url: '/drivers',
    handler: async (request, reply) => {
      const { dto, errors } = await validateBody(QueryDriverDto, request.body);
      if (errors.length > 0) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: errors,
        })
      }
      reply.send(await driverService.search(dto));
    },
  });

  fastify.route({
    method: 'QUERY',
    url: '/motorcycles',
    handler: async (request, reply) => {
      const { dto, errors } = await validateBody(QueryMotorcycleDto, request.body);
      if (errors.length > 0) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: errors,
        })
      }
      reply.send(await motorcycleService.search(dto));
    },
  });

  fastify.route({
    method: 'QUERY',
    url: '/service-orders',
    handler: async (request, reply) => {
      const { dto, errors } = await validateBody(QueryServiceOrderDto, request.body);
      if (errors.length > 0) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: errors,
        })
      }
      reply.send(await serviceOrderService.search(dto));
    },
  });
}

async function validateBody<T extends object>(
  dtoClass: new () => T,
  body: unknown,
): Promise<{ dto: T; errors: string[] }> {
  const dto = plainToInstance(dtoClass, body ?? {});
  const validationErrors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const errors = validationErrors.flatMap((e) =>
    Object.values(e.constraints ?? {}),
  );
  return { dto, errors };
}

bootstrap();