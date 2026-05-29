import { Module } from '@nestjs/common';
import { ForumModule } from '../forum/forum.module';
import { FreelancersModule } from '../freelancers/freelancers.module';
import { ProjectsModule } from '../projects/projects.module';
import { SolutionsModule } from '../solutions/solutions.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [ProjectsModule, FreelancersModule, SolutionsModule, ForumModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
