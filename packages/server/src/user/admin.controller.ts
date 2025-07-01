import { Controller, UseGuards } from '@nestjs/common';
import AdminGuard from 'src/auth/admin.guard';

@Controller('admin')
@UseGuards(new AdminGuard())
export default class AdminController {}
