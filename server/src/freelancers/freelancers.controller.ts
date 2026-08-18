import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/user.decorator';
import { ListFreelancersQueryDto } from './dto/list-freelancers-query.dto';
import { FreelancersService } from './freelancers.service';

/**
 * Визитки фрилансеров (маркетплейс, зона Антона).
 * Префикс: /api/freelancers
 *
 * «Публичный» = виден другим пользователям после входа, не гостям из интернета.
 */
@Controller('freelancers')
@UseGuards(AuthGuard)
export class FreelancersController {
  constructor(private freelancers: FreelancersService) {}

  /**
   * GET /api/freelancers?q= — каталог специалистов.
   * Доступен и гостям: без валидного токена AuthGuard пропускает запрос, но
   * req.user остаётся пустым, и сервис отдаёт обезличенные карточки.
   */
  @Public()
  @Get()
  list(
    @Query() query: ListFreelancersQueryDto,
    @Req() req: { user?: { id: string } },
  ) {
    return this.freelancers.list(query, { anonymous: !req.user });
  }

  /** GET /api/freelancers/:username — визитка + ProfileView */
  @Get(':username')
  getOne(
    @Param('username') username: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.freelancers.getPublicByUsername(username, user.id);
  }
}
