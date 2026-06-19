import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = authHeader.slice(7);
    const { data: { user }, error } = await this.supabase.client.auth.getUser(token);
    if (error || !user) throw new UnauthorizedException();

    req.user = user;
    return true;
  }
}
