import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { BlockUserDto } from './dto/block-user.dto';
import { BlocksService } from './blocks.service';

@Controller('blocks')
export class BlocksController {
  constructor(private blocks: BlocksService) {}

  @Get()
  @UseGuards(AuthGuard)
  list(@CurrentUser() user: { id: string }) {
    return this.blocks.list(user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  block(@CurrentUser() user: { id: string }, @Body() dto: BlockUserDto) {
    return this.blocks.block(user.id, dto.blockedId);
  }

  @Delete(':blockedId')
  @UseGuards(AuthGuard)
  unblock(
    @CurrentUser() user: { id: string },
    @Param('blockedId') blockedId: string,
  ) {
    return this.blocks.unblock(user.id, blockedId);
  }
}
