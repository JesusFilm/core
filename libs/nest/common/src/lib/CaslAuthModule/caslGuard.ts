import { PureAbility } from '@casl/ability'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

import { contextToUserId } from '../firebaseClient'

import { CaslFactory } from './caslFactory'
import { CASL_POLICY_KEY, CaslPolicyHandler } from './decorators/caslPolicy'

/**
 * Guard that is used in conjunction with `CaslAbility`, `CaslAccessible` and `CaslPolicy` decorators.
 * Works with either HTTP or GraphQL requests.
 * @example
 * ```ts
 * ＠UseGuards(CaslGuard)
 * async getBlogs(
 *   ＠CaslAbility() ability: AppAbility,
 *   ＠CaslAccessible('Blog') accessibleBlogs: Prisma.BlogWhereInput
 * ) { ... }
 * ```
 * @example
 * ```ts
 * ＠UseGuards(CaslGuard)
 * ＠CaslPolicy((ability: AppAbility) => ability.can('read', 'Blog'))
 * async getBlogs() { ... }
 * ```
 */
@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslFactory: CaslFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = GqlExecutionContext.create(context).getContext<{
      req: {
        userId?: string | null
        roles?: string[] | null
        ability?: PureAbility | null
      }
    }>().req

    if (req.userId == null) {
      req.userId = contextToUserId(context)
    }

    if (req.userId == null) return false

    if (req.roles == null) req.roles = await this.loadRoles(req.userId)

    if (req.ability == null)
      req.ability = await this.caslFactory.createAbility({
        id: req.userId,
        roles: req.roles
      })

    const classPolicies =
      this.reflector.get<CaslPolicyHandler[] | undefined>(
        CASL_POLICY_KEY,
        context.getClass()
      ) ?? []
    const handlerPolicies =
      this.reflector.get<CaslPolicyHandler[] | undefined>(
        CASL_POLICY_KEY,
        context.getHandler()
      ) ?? []
    const policies = classPolicies.concat(handlerPolicies)

    if (req.ability != null)
      return policies.every(
        (handler) => req.ability != null && handler(req.ability)
      )

    return false
  }

  protected async loadRoles(_userId: string): Promise<string[]> {
    return []
  }
}
