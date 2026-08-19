import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  get(@CurrentUser() user: any) {
    return this.settings.getSettings(user.id);
  }

  @Patch('account')
  updateAccount(@CurrentUser() user: any, @Body() body: UpdateAccountDto) {
    return this.settings.updateAccount(user.id, body);
  }

  @Patch('privacy')
  updatePrivacy(@CurrentUser() user: any, @Body() body: any) {
    return this.settings.updatePrivacy(user.id, body);
  }

  @Delete()
  deleteAccount(@CurrentUser() user: any) {
    return this.settings.deleteAccount(user.id);
  }
}
