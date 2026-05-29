import { Injectable } from '@nestjs/common';
import { ForumPostsService } from '../forum/forum-posts.service';
import { FreelancersService } from '../freelancers/freelancers.service';
import { ProjectsService } from '../projects/projects.service';
import { SolutionsService } from '../solutions/solutions.service';

/** Агрегатор глобального поиска — без новой таблицы, см. docs/SEARCH.md */
@Injectable()
export class SearchService {
  constructor(
    private projects: ProjectsService,
    private freelancers: FreelancersService,
    private solutions: SolutionsService,
    private forum: ForumPostsService,
  ) {}

  async search(q?: string) {
    const trimmed = q?.trim() ?? '';
    if (!trimmed) {
      return {
        projects: [],
        freelancers: [],
        solutions: [],
        forum: [],
      };
    }

    const [projects, freelancers, solutions, forum] = await Promise.all([
      this.projects.findAll({ q: trimmed }),
      this.freelancers.list({ q: trimmed }),
      this.solutions.findAll({ q: trimmed }),
      this.forum.findAll({ q: trimmed }),
    ]);

    return { projects, freelancers, solutions, forum };
  }
}
