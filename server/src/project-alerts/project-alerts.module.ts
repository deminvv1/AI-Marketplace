import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProjectAlertsMatcherService } from './project-alerts-matcher.service';
import { ProjectAlertsController } from './project-alerts.controller';
import { ProjectAlertsService } from './project-alerts.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ProjectAlertsController],
  providers: [ProjectAlertsService, ProjectAlertsMatcherService],
  exports: [ProjectAlertsMatcherService],
})
export class ProjectAlertsModule {}
