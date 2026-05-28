import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: any) {
    return this.profile.getProfile(user.id);
  }

  @Patch()
  update(@CurrentUser() user: any, @Body() body: any) {
    return this.profile.updateProfile(user.id, body);
  }
}
