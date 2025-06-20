import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: configService.get('CLIENT_HOST') as string,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  });

  const secret = configService.get<string>('COOKIE_SECRET')!;
  app.use(cookieParser(secret));

  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(json({ limit: '50mb' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
