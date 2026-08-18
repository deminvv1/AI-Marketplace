import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from './supabase.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private supabase: SupabaseService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      if (isPublic) return true;
      throw new UnauthorizedException();
    }

    const token = authHeader.slice(7);
    const { data: { user }, error } = await this.supabase.client.auth.getUser(token);
    if (error || !user) {
      if (isPublic) return true;
      throw new UnauthorizedException();
    }

    req.user = user;
    return true;
  }
}
