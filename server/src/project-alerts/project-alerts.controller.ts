import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateProjectAlertDto } from './dto/create-project-alert.dto';
import { UpdateProjectAlertDto } from './dto/update-project-alert.dto';
import { ProjectAlertsService } from './project-alerts.service';

/** Project alerts (подписки на новые проекты): /api/project-alerts */
@Controller('project-alerts')
@UseGuards(AuthGuard)
export class ProjectAlertsController {
  constructor(private alerts: ProjectAlertsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.alerts.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProjectAlertDto,
  ) {
    return this.alerts.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProjectAlertDto,
  ) {
    return this.alerts.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.alerts.remove(id, user.id);
  }
}
