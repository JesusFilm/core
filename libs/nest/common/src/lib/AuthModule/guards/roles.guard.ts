import {
  ExecutionContext,
  Injectable,
  mixin,
  CanActivate,
  Type
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

import { ALLOW_ANONYMOUS_KEY } from '../decorators/allowAnonymous.decorator'

// import { Role } from '@zen/common';

/**
 * A guard that takes a list of roles for its parameters and checks if the user has at least
 * one of them. Works with either HTTP or GraphQL requests. The following will require the
 * user to have either the `Admin` or `Moderator` roles.
 * ```ts
 * ＠UseGuards(RolesGuard('Admin', 'Moderator'))
 * ```
 * The following will require the user to have both the `Admin` and `Moderator` roles.
 * ```ts
 * ＠UseGuards(RolesGuard('Admin'), RolesGuard('Moderator'))
 * ```
 * If no roles are passed as parameters, it will only verify that the request has a valid JWT
 * and extracts the `RequestUser` to be injected via the `＠CurrentUser` decorator.
 * ```ts
 * ＠UseGuards(RolesGuard())
 * accountInfo(＠CurrentUser() user: RequestUser) { ... }
 * ```
 */
export function RolesGuard<R extends string>(...roles: R[]): Type<CanActivate> {
  if (new.target !== undefined)
    throw new Error(
      'RolesGuard cannot be instantiated directly. Use RolesGuard() instead.'
    )

  @Injectable()
  class MixinRolesGuard implements CanActivate {
    constructor(readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const allowAnonymousHandler = this.reflector.get<boolean | undefined>(
        ALLOW_ANONYMOUS_KEY,
        context.getHandler()
      )

      if (allowAnonymousHandler != null) return true

      const allowAnonymousClass = this.reflector.get<boolean | undefined>(
        ALLOW_ANONYMOUS_KEY,
        context.getClass()
      )

      if (allowAnonymousClass != null) return true

      const req = GqlExecutionContext.create(context).getContext().req

      if (req.user == null) return false

      if (roles.length === 0) return true

      return rbacLogic(req.user.roles ?? [], roles)
    }
  }

  return mixin(MixinRolesGuard)
}

export function rbacLogic(
  userRoles: string[],
  definedRoles: string[]
): boolean {
  return (
    userRoles.includes('Super') ||
    definedRoles.some((definedRole) => userRoles.includes(definedRole))
  )
}
