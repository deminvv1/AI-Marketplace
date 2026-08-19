import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Strict } from '../common/strict-throttle.decorator';
import { sanitizeRole } from '../common/roles';

@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private onboarding: OnboardingService) {}

  @Post('init')
  @Strict()
  init(@CurrentUser() user: any, @Body() body: { role?: string; avatarUrl?: string; country?: string }) {
    return this.onboarding.createIfNotExists(
      user.id,
      user.email,
      body.avatarUrl ?? user.user_metadata?.avatar_url ?? null,
      sanitizeRole(body.role),
      body.country ?? null,
    );
  }

  @Post('complete')
  complete(@CurrentUser() user: any, @Body() body: { role?: string; username?: string }) {
    // Роль приходит из браузера, поэтому доверять ей нельзя: без приведения
    // человек мог бы завершить онбординг администратором.
    return this.onboarding.complete(user.id, {
      ...body,
      role: sanitizeRole(body?.role),
      username: String(body?.username ?? ''),
    });
  }
}
