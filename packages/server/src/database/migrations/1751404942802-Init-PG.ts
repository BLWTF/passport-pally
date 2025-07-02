import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPG1751404942802 implements MigrationInterface {
  name = 'InitPG1751404942802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "googleProviderAccountId" character varying, "email" character varying, "username" character varying, "lastName" character varying, "firstName" character varying, "password" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "state" ("id" integer NOT NULL DEFAULT '1', "state" text NOT NULL, CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "state"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
