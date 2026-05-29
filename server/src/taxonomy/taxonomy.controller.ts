import { Controller, Get } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

/** GET /api/taxonomy — справочник industry (Category) и skills */
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private taxonomy: TaxonomyService) {}

  @Get()
  list() {
    return this.taxonomy.list();
  }

  @Get('skills')
  listSkills() {
    return this.taxonomy.listSkills();
  }
}
