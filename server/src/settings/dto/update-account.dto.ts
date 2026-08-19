import { IsIn, IsString } from 'class-validator';
import { SELF_ASSIGNABLE_ROLES, type SelfAssignableRole } from '../../common/roles';

export class UpdateAccountDto {
  @IsString()
  username!: string;

  @IsIn(SELF_ASSIGNABLE_ROLES, {
    message: `role must be one of: ${SELF_ASSIGNABLE_ROLES.join(', ')}`,
  })
  role!: SelfAssignableRole;
}
