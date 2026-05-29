import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { ProjectProposalsService } from '../projects/project-proposals.service';

/** Отклики текущего фрилансера: GET /api/proposals/mine */
@Controller('proposals')
@UseGuards(AuthGuard)
export class ProposalsController {
  constructor(private proposals: ProjectProposalsService) {}

  @Get('mine')
  listMine(@CurrentUser() user: { id: string }) {
    return this.proposals.listMine(user.id);
  }
}
