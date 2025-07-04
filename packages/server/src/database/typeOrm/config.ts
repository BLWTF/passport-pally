import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import UserEntity from '../../../src/user/user.entity';
import AppStateEntity from '../../../src/state/state.entity';
import { DataSource } from 'typeorm';
import { Init1751404822487 } from '../migrations/1751404822487-Init';
import { InitPG1751404942802 } from '../migrations/1751404942802-Init-PG';

config();

const configService = new ConfigService();

const DBType: 'mysql' = configService.get('DB_TYPE')!;

const migrations =
  DBType === 'mysql' ? [Init1751404822487] : [InitPG1751404942802];

export default new DataSource({
  type: DBType,
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [UserEntity, AppStateEntity],
  migrations,
});
