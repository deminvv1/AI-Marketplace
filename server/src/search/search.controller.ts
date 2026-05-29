import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';

/** GET /api/search?q= — только залогиненные */
@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private search: SearchService) {}

  @Get()
  findAll(@Query() query: SearchQueryDto) {
    return this.search.search(query);
  }
}
