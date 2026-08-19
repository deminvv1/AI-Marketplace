/**
 * Роли, которые пользователь вправе присвоить себе сам — при регистрации,
 * в онбординге и в настройках.
 *
 * ADMIN сюда не входит намеренно: роль читается из тела запроса, и без этого
 * списка любой зарегистрированный человек мог бы сделать себя администратором
 * и получить доступ к списку всех пользователей и к блокировкам. Права
 * администратора выдаются только вручную в базе.
 */
export const SELF_ASSIGNABLE_ROLES = ['CLIENT', 'FREELANCER', 'BOTH'] as const;
export type SelfAssignableRole = (typeof SELF_ASSIGNABLE_ROLES)[number];

export function isSelfAssignableRole(value: unknown): value is SelfAssignableRole {
  return typeof value === 'string' && (SELF_ASSIGNABLE_ROLES as readonly string[]).includes(value);
}

/** Приводит присланную роль к допустимой; всё непонятное становится CLIENT. */
export function sanitizeRole(value: unknown): SelfAssignableRole {
  return isSelfAssignableRole(value) ? value : 'CLIENT';
}
