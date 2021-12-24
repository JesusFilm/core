import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
  Type
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { UserJourneyService } from '../../modules/userJourney/userJourney.service'
import { UserJourneyRole } from '../../__generated__/graphql'
import { get, includes } from 'lodash'
import { AuthenticationError } from 'apollo-server-errors'

export const RoleGuard = (
  journeyIdArgName: string,
  roles: UserJourneyRole[] | UserJourneyRole
): Type<CanActivate> => {
  @Injectable()
  class RolesGuard implements CanActivate {
    constructor(private readonly userJourneyService: UserJourneyService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context).getContext()
      const userId = ctx.headers['user-id']

      if (userId == null) return false

      const args = context.getArgByIndex(1)
      const actor = await this.userJourneyService.forJourneyUser(
        get(args, journeyIdArgName),
        userId
      )
      console.log(actor)

      const result = Array.isArray(roles)
        ? includes(roles, actor?.role)
        : roles === actor?.role
      if (!result)
        throw new AuthenticationError(
          'User does not have the role to perform this action'
        )
      return result
    }
  }
  const guard = mixin(RolesGuard)
  return guard
}
