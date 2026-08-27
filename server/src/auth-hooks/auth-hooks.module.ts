import { Module } from '@nestjs/common';
import { UnisenderService } from '../notifications/unisender.service';
import { AuthHooksController } from './auth-hooks.controller';

@Module({
  controllers: [AuthHooksController],
  providers: [UnisenderService],
})
export class AuthHooksModule {}
