import {
  Controller, Get, Post, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from './admin.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  getStats() {
    return this.admin.getStats();
  }

  @Get('users')
  listUsers(
    @Query('q') q?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.admin.listUsers(q, page, limit);
  }

  @Post('users/:id/ban')
  ban(@Param('id') id: string, @CurrentUser() me: any) {
    return this.admin.banUser(id, me.id);
  }

  @Post('users/:id/unban')
  unban(@Param('id') id: string) {
    return this.admin.unbanUser(id);
  }

  @Get('reports')
  listReports(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.admin.listReports(page, limit);
  }
}
