import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import UserEntity from '../../../src/user/user.entity';
import { DataSource } from 'typeorm';
import { UserPG1749060335644 } from '../migrations/1749060335644-User-PG';

config();

const configService = new ConfigService();

const DBType: 'mysql' = configService.get('DB_TYPE')!;

export default new DataSource({
  type: DBType,
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [UserEntity],
  migrations: [UserPG1749060335644],
});
