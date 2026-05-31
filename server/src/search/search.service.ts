import { Injectable } from '@nestjs/common';
import { ForumPostsService } from '../forum/forum-posts.service';
import { FreelancersService } from '../freelancers/freelancers.service';
import { ProjectsService } from '../projects/projects.service';
import { SolutionsService } from '../solutions/solutions.service';
import { SearchQueryDto } from './dto/search-query.dto';

/** Агрегатор глобального поиска — без новой таблицы, см. docs/SEARCH.md */
@Injectable()
export class SearchService {
  constructor(
    private projects: ProjectsService,
    private freelancers: FreelancersService,
    private solutions: SolutionsService,
    private forum: ForumPostsService,
  ) {}

  async search(query: SearchQueryDto = {}) {
    const trimmed = query.q?.trim() ?? '';
    const tag = query.tag?.trim();
    const industry = query.industry?.trim();

    if (!trimmed && !tag && !industry) {
      return {
        projects: [],
        freelancers: [],
        solutions: [],
        forum: [],
      };
    }

    const listQuery = {
      ...(trimmed ? { q: trimmed } : {}),
      ...(tag ? { tag } : {}),
      ...(industry ? { industry } : {}),
    };

    const [projects, freelancers, solutions, forum] = await Promise.all([
      this.projects.findAll(listQuery),
      trimmed
        ? this.freelancers.list({ q: trimmed })
        : Promise.resolve([]),
      this.solutions.findAll(listQuery),
      this.forum.findAll(listQuery),
    ]);

    return { projects, freelancers, solutions, forum };
  }
}
