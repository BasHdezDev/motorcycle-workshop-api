import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSub, Message } from '@google-cloud/pubsub';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ConsumerService.name);
  private readonly pubsub = new PubSub({
    projectId: process.env.PUBSUB_PROJECT_ID,
  });

  onModuleInit() {
    const subscription = this.pubsub.subscription(process.env.PUBSUB_SUBSCRIPTION ?? 'flujo-v2-sub');

    subscription.on('message', (message: Message) => this.handleMessage(message));
    subscription.on('error', (error) => this.logger.error(`Subscription error: ${error}`));

    this.logger.log('Pub/Sub consumer listening on flujo-v2-sub');
  }

  private handleMessage(message: Message) {
    try {
      const payload = JSON.parse(message.data.toString());
      this.logger.log(`Mensaje recibido: correlationId=${payload.correlationId}, action=${payload.action}`);

      if (payload.forceFail) {
        throw new Error('Fallo forzado para pruebas de DLQ');
      }

      this.logger.log(`Mensaje procesado correctamente: ${message.id}`);
      message.ack();
    } catch (error) {
      this.logger.error(`Error procesando mensaje ${message.id}: ${error}`);
      message.nack(); 
    }
  }
}