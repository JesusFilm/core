import { PureAbility } from '@casl/ability'
import { CustomDecorator, SetMetadata } from '@nestjs/common'

export type CaslPolicyHandler = (ability: PureAbility) => boolean
export const CASL_POLICY_KEY = 'CaslPolicy'

/**
 * Decorator to be applied to a class or method to specify authorization.
 * @example
 * ```ts
 * ＠UseGuards(CaslGuard)
 * ＠CaslPolicy((ability: AppAbility) => ability.can('read', 'Blog'))
 * async getBlogs() { ... }
 * ```
 */
export const CaslPolicy = (...handlers: CaslPolicyHandler[]): CustomDecorator =>
  SetMetadata(CASL_POLICY_KEY, handlers)
