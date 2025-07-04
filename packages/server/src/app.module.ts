import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import GeminiModule from './gemini/gemini.module';
import JwtToPayloadMiddleware from './auth/jwt-to-payload.middleware';
import AuthModule from './auth/auth.module';
import UserModule from './user/user.module';
import DatabaseModule from './database/database.module';
import StateModule from './state/state.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DatabaseModule,
    GeminiModule,
    StateModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtToPayloadMiddleware).forRoutes('*');
  }
}
