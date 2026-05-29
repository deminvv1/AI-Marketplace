import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
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

  /** GET /api/freelancers — каталог */
  @Get()
  list() {
    return this.freelancers.list();
  }

  /** GET /api/freelancers/:username — визитка + учёт просмотра (ProfileView) */
  @Get(':username')
  getOne(
    @Param('username') username: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.freelancers.getPublicByUsername(username, user.id);
  }
}
