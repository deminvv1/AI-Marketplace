import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { privacy: true },
    });
  }

  async updateAccount(userId: string, dto: { username: string; role: Role }) {
    const username = dto.username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      throw new BadRequestException('Username must be 3–30 characters: letters, numbers, underscores only.');
    }

    const taken = await this.prisma.user.findUnique({ where: { username } });
    if (taken && taken.id !== userId) {
      throw new BadRequestException('This username is already taken.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { username, role: dto.role },
    });

    return { success: true };
  }

  async updatePrivacy(userId: string, dto: {
    phoneVisible: boolean;
    emailVisible: boolean;
    profileVisible: boolean;
    onlineVisible: boolean;
    lastSeenVisible: boolean;
  }) {
    await this.prisma.privacySettings.update({
      where: { userId },
      data: dto,
    });
    return { success: true };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    await supabase.auth.admin.deleteUser(userId);

    return { success: true };
  }
}
