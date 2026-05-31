import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxonomyService implements OnModuleInit {
  private categoryBySlug = new Map<string, { name: string; slug: string }>();
  private categoryByName = new Map<string, { name: string; slug: string }>();
  private skillBySlug = new Map<string, { name: string; slug: string }>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  async refreshCache() {
    const [categories, skills] = await Promise.all([
      this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.skill.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);
    this.categoryBySlug.clear();
    this.categoryByName.clear();
    this.skillBySlug.clear();
    for (const c of categories) {
      this.categoryBySlug.set(c.slug.toLowerCase(), c);
      this.categoryByName.set(c.name.toLowerCase(), c);
    }
    for (const s of skills) {
      this.skillBySlug.set(s.slug.toLowerCase(), s);
    }
  }

  list() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        skills: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  listSkills() {
    return this.prisma.skill.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, categoryId: true },
    });
  }

  /** Каноническое имя категории для поля industry */
  normalizeIndustry(input?: string | null): string | null {
    if (!input?.trim()) return null;
    const key = input.trim().toLowerCase();
    const hit =
      this.categoryBySlug.get(key) ?? this.categoryByName.get(key);
    if (!hit) {
      throw new BadRequestException(
        'Invalid industry. Choose a value from the category list.',
      );
    }
    return hit.name;
  }

  /** Канонические slug навыков для tags[] */
  normalizeTags(inputs?: string[] | null): string[] {
    if (!inputs?.length) return [];
    const slugs: string[] = [];
    for (const raw of inputs) {
      const key = raw.trim().toLowerCase();
      if (!key) continue;
      const hit = this.skillBySlug.get(key);
      if (!hit) {
        throw new BadRequestException(
          `Invalid skill tag: "${raw}". Choose from the skills list.`,
        );
      }
      if (!slugs.includes(hit.slug)) slugs.push(hit.slug);
    }
    return slugs;
  }

  normalizeIndustries(inputs?: string[] | null): string[] {
    if (!inputs?.length) return [];
    return inputs.map((i) => this.normalizeIndustry(i)!);
  }
}
