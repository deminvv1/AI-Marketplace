import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import sharp = require('sharp');

interface UploadedFile { buffer: Buffer; mimetype: string; }

@Injectable()
export class UsersService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });
    return { exists: !!user };
  }

  async createUser(id: string, email: string, avatarUrl: string | null, role: Role) {
    return this.prisma.user.create({
      data: {
        id,
        email,
        avatarUrl,
        role,
        profile: { create: {} },
        privacy: { create: {} },
      },
    });
  }

  async uploadAvatar(userId: string, file: UploadedFile) {
    const webp = await sharp(file.buffer)
      .resize(256, 256, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toBuffer();

    const path = `${userId}.webp`;

    const { error } = await this.supabase.storage
      .from('avatars')
      .upload(path, webp, { contentType: 'image/webp', upsert: true });

    if (error) throw new Error(error.message);

    const { data } = this.supabase.storage.from('avatars').getPublicUrl(path);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: data.publicUrl },
    });

    return { avatarUrl: data.publicUrl };
  }

  async deleteAvatar(userId: string) {
    await this.supabase.storage.from('avatars').remove([`${userId}.webp`]);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return { success: true };
  }
}
