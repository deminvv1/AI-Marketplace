import { Module } from '@nestjs/common';
import { ProjectAlertsModule } from '../project-alerts/project-alerts.module';
import { ProjectProposalsController } from './project-proposals.controller';
import { ProjectProposalsService } from './project-proposals.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

/**
 * Модуль маркетплейса: Project + вложенные Proposal.
 * Владелец зоны: Антон (см. docs/TASKS.md).
 */
@Module({
  imports: [ProjectAlertsModule],
  controllers: [ProjectsController, ProjectProposalsController],
  providers: [ProjectsService, ProjectProposalsService],
  exports: [ProjectsService, ProjectProposalsService],
})
export class ProjectsModule {}
