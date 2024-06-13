import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

/**
 * Parameter decorator to provide the `CaslAbility` for the current user.
 * Works with either HTTP or GraphQL requests.
 * ```ts
 * ＠UseGuards(CaslGuard)
 * sample(＠CaslAbility() ability: AppAbility) { ... }
 * ```
 */
export const CaslAbility = createParamDecorator(
  (data: { optional?: boolean } | undefined, context: ExecutionContext) => {
    const ability = GqlExecutionContext.create(context).getContext().req.ability

    if (ability == null && data?.optional !== true)
      throw new UnauthorizedException('No ability found for request')

    return ability
  }
)
