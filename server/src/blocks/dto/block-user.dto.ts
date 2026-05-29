import { IsUUID } from 'class-validator';

export class BlockUserDto {
  @IsUUID()
  blockedId: string;
}
