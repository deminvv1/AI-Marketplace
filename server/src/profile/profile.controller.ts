import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { ProfileService } from './profile.service';

/**
 * Свой профиль (владелец): Read + Update.
 * Портфолио: полный CRUD на вложенном пути /profile/portfolio.
 */
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private profile: ProfileService) {}

  /** GET — прочитать свой User + Profile + portfolioItems */
  @Get()
  get(@CurrentUser() user: { id: string }) {
    return this.profile.getProfile(user.id);
  }

  /** PATCH — обновить поля Profile (bio, skills…) */
  @Patch()
  update(@CurrentUser() user: { id: string }, @Body() body: Record<string, unknown>) {
    return this.profile.updateProfile(user.id, body as Parameters<
      ProfileService['updateProfile']
    >[1]);
  }

  /** POST portfolio — создать элемент */
  @Post('portfolio')
  createPortfolio(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePortfolioItemDto,
  ) {
    return this.profile.createPortfolioItem(user.id, dto);
  }

  /** PATCH portfolio/:itemId — обновить */
  @Patch('portfolio/:itemId')
  updatePortfolio(
    @CurrentUser() user: { id: string },
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePortfolioItemDto,
  ) {
    return this.profile.updatePortfolioItem(user.id, itemId, dto);
  }

  /** DELETE portfolio/:itemId — удалить */
  @Delete('portfolio/:itemId')
  deletePortfolio(
    @CurrentUser() user: { id: string },
    @Param('itemId') itemId: string,
  ) {
    return this.profile.deletePortfolioItem(user.id, itemId);
  }
}
