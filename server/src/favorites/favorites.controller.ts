import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { FavoritesService } from './favorites.service';

/**
 * Избранное (Favorite) — закладки на фрилансеров, проекты, решения.
 * /api/favorites
 */
@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private favorites: FavoritesService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('targetType') targetType?: string,
  ) {
    return this.favorites.list(user.id, targetType);
  }

  @Get('check')
  check(
    @CurrentUser() user: { id: string },
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: string,
  ) {
    return this.favorites.isFavorited(user.id, targetId, targetType);
  }

  @Post()
  add(@CurrentUser() user: { id: string }, @Body() dto: ToggleFavoriteDto) {
    return this.favorites.add(user.id, dto);
  }

  @Delete()
  remove(@CurrentUser() user: { id: string }, @Body() dto: ToggleFavoriteDto) {
    return this.favorites.remove(user.id, dto);
  }
}
