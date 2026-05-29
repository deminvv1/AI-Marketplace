import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

/**
 * REST: Project (заказ на бирже).
 * Префикс глобальный: /api/projects
 *
 * Важно: маршрут `mine` объявлен ДО `:id`, иначе Nest примет "mine" как uuid.
 */
@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  /** GET /api/projects — публичный список OPEN-проектов. */
  @Get()
  findAll() {
    return this.projects.findAll();
  }

  /** GET /api/projects/mine — проекты текущего пользователя (JWT). */
  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: { id: string }) {
    return this.projects.findMine(user.id);
  }

  /** GET /api/projects/:id — карточка одного проекта. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projects.findOne(id);
  }

  /** POST /api/projects — создать проект (роль CLIENT/BOTH). */
  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateProjectDto) {
    return this.projects.create(user.id, dto);
  }
}
