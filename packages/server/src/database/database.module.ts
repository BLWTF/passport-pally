import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from 'src/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const DBType: 'mysql' = configService.get('DB_TYPE')!;
        const entities = [UserEntity];

        // if (configService.get('NODE_ENV') === 'production') {
        //   return {
        //     type: DBType,
        //     url: configService.get('DB_URL'),
        //     entities,
        //   };
        // }

        return {
          type: DBType,
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities,
          autoLoadEntities: true,
          synchronize: false,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
  ],
})
export default class DatabaseModule {}
