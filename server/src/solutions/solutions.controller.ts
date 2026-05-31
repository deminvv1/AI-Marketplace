import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateSolutionDto } from './dto/create-solution.dto';
import { ListSolutionsQueryDto } from './dto/list-solutions-query.dto';
import { UpdateSolutionDto } from './dto/update-solution.dto';
import { SolutionsService } from './solutions.service';

/**
 * Готовые AI-решения (Solution, бывший Offer).
 * /api/solutions
 */
@Controller('solutions')
export class SolutionsController {
  constructor(private solutions: SolutionsService) {}

  /** GET — каталог (isPublished=true) */
  @Get()
  findAll(@Query() query: ListSolutionsQueryDto) {
    return this.solutions.findAll(query);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: { id: string }) {
    return this.solutions.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solutions.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSolutionDto,
  ) {
    return this.solutions.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateSolutionDto,
  ) {
    return this.solutions.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.solutions.remove(id, user.id);
  }
}
