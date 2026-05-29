import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
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
  ],
})
export class AppModule {}
