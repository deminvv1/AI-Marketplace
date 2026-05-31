import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateReportDto,
  ) {
    return this.reports.create(user.id, dto);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  listMine(@CurrentUser() user: { id: string }) {
    return this.reports.listMine(user.id);
  }
}
