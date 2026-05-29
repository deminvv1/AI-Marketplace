import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private onboarding: OnboardingService) {}

  @Post('init')
  init(@CurrentUser() user: any, @Body() body: { role?: string; avatarUrl?: string }) {
    return this.onboarding.createIfNotExists(
      user.id,
      user.email,
      body.avatarUrl ?? user.user_metadata?.avatar_url ?? null,
      (body.role as any) ?? 'CLIENT',
    );
  }

  @Post('complete')
  complete(@CurrentUser() user: any, @Body() body: any) {
    return this.onboarding.complete(user.id, body);
  }
}
