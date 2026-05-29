import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { ProposalsController } from './proposals.controller';

@Module({
  imports: [ProjectsModule],
  controllers: [ProposalsController],
})
export class ProposalsModule {}
