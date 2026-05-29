import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module';
import { FreelancersController } from './freelancers.controller';
import { FreelancersService } from './freelancers.service';

@Module({
  imports: [ProfileModule],
  controllers: [FreelancersController],
  providers: [FreelancersService],
  exports: [FreelancersService],
})
export class FreelancersModule {}
