import {
  Controller, Get, Post, Delete, Query, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: any) {
    return this.users.findById(user.id);
  }

  @Get('check-email')
  checkEmail(@Query('email') email: string) {
    return this.users.checkEmail(email);
  }

  @Post('avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file provided');
    return this.users.uploadAvatar(user.id, file);
  }

  @Delete('avatar')
  @UseGuards(AuthGuard)
  deleteAvatar(@CurrentUser() user: any) {
    return this.users.deleteAvatar(user.id);
  }

}
