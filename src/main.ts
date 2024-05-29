import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerService } from './logger.service';

async function bootstrap() {
  const winstonLoggerService = new WinstonLoggerService();
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerService.createLoggerConfig),
  });
  await app.listen(8000);
}
bootstrap();
