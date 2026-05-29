import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { ProjectProposalsService } from './project-proposals.service';

/**
 * Вложенный ресурс: отклики (Proposal) привязаны к проекту (Project).
 * Базовый путь: /api/projects/:projectId/proposals
 */
@Controller('projects/:projectId/proposals')
export class ProjectProposalsController {
  constructor(private proposals: ProjectProposalsService) {}

  /** POST — фрилансер отправляет отклик. */
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposals.create(projectId, user.id, dto);
  }

  /** GET — заказчик видит все отклики на свой проект. */
  @Get()
  @UseGuards(AuthGuard)
  listForOwner(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.proposals.listForProjectOwner(projectId, user.id);
  }

  /** GET mine — текущий пользователь: свой отклик на этот проект (или null). */
  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.proposals.findMineOnProject(projectId, user.id);
  }

  /** PATCH accept — заказчик нанимает фрилансера по отклику */
  @Patch(':proposalId/accept')
  @UseGuards(AuthGuard)
  accept(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.proposals.accept(projectId, proposalId, user.id);
  }

  /** PATCH reject — отклонить отклик без смены статуса проекта */
  @Patch(':proposalId/reject')
  @UseGuards(AuthGuard)
  reject(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.proposals.reject(projectId, proposalId, user.id);
  }
}
