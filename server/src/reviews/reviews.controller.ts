import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

/**
 * Отзывы (Review) — рейтинг фрилансера после проекта.
 * /api/reviews
 */
@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  /** GET /api/reviews/user/:userId — отзывы о пользователе */
  @Get('user/:userId')
  listForUser(@Param('userId') userId: string) {
    return this.reviews.listForUser(userId);
  }

  /** GET /api/reviews/project/:projectId — отзыв по проекту (или null) */
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.reviews.findByProject(projectId);
  }

  /** POST /api/reviews — оставить отзыв */
  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(user.id, dto);
  }
}
