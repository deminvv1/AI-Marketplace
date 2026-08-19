import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isSelfAssignableRole } from '../common/roles';
import { UpdateAccountDto } from './dto/update-account.dto';
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

  async updateAccount(userId: string, dto: UpdateAccountDto) {
    const username = dto.username.trim().toLowerCase();

    // Проверка повторяется здесь намеренно: если завтра этот метод вызовут в
    // обход контроллера с его DTO, повышение прав всё равно не пройдёт.
    if (!isSelfAssignableRole(dto.role)) {
      throw new BadRequestException('This role cannot be set.');
    }

    // Администратора нельзя понизить через обычные настройки — иначе учётную
    // запись можно было бы лишить прав случайным сохранением формы.
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (current?.role === 'ADMIN') {
      throw new BadRequestException('An administrator account cannot change its own role here.');
    }

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
