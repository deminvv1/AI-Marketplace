import { Global, Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from './supabase.service';

// Global so AuthGuard and SupabaseService are available everywhere without re-importing.
@Global()
@Module({
  providers: [SupabaseService, AuthGuard],
  exports: [SupabaseService, AuthGuard],
})
export class AuthModule {}
