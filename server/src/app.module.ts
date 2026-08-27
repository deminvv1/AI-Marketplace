import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { SettingsModule } from './settings/settings.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ProjectsModule } from './projects/projects.module';
import { FreelancersModule } from './freelancers/freelancers.module';
import { SolutionsModule } from './solutions/solutions.module';
import { ForumModule } from './forum/forum.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProjectAlertsModule } from './project-alerts/project-alerts.module';
import { ProposalsModule } from './proposals/proposals.module';
import { SearchModule } from './search/search.module';
import { MessagesModule } from './messages/messages.module';
import { ReportsModule } from './reports/reports.module';
import { BlocksModule } from './blocks/blocks.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { AuthHooksModule } from './auth-hooks/auth-hooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60_000, limit: 100 },   // 100 req / 60s — глобально
      { name: 'strict', ttl: 60_000, limit: 10 },     // 10 req / 60s — для чувствительных
    ]),
    AuthModule,
    PrismaModule,
    TaxonomyModule,
    UsersModule,
    ProfileModule,
    SettingsModule,
    OnboardingModule,
    ProjectsModule,
    FreelancersModule,
    SolutionsModule,
    ForumModule,
    ReviewsModule,
    FavoritesModule,
    NotificationsModule,
    ProjectAlertsModule,
    ProposalsModule,
    SearchModule,
    MessagesModule,
    ReportsModule,
    BlocksModule,
    ChatModule,
    AdminModule,
    AuthHooksModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
