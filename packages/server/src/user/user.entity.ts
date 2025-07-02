import { User, UserRole } from 'src/types/users';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export default class UserEntity implements User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  googleProviderAccountId?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true, unique: true })
  username?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}
