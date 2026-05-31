import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
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

  /** GET /api/freelancers?q= — каталог (только залогиненные) */
  @Get()
  list(@Query() query: ListFreelancersQueryDto) {
    return this.freelancers.list(query);
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
