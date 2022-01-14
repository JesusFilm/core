import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
  Inject
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { get, includes } from 'lodash'
import { AuthenticationError } from 'apollo-server-errors'
import { UserJourneyService } from '../../modules/userJourney/userJourney.service'
import { UserJourney, UserJourneyRole } from '../../__generated__/graphql'

// broken out into function for test injection
export const checkActor = async (
  userJourneyService: UserJourneyService,
  journeyId: string,
  userId: string
): Promise<UserJourney> => {
  return await userJourneyService.forJourneyUser(journeyId, userId)
}

export const RoleGuard = (
  journeyIdArgName: string,
  roles: UserJourneyRole[] | UserJourneyRole,
  ca: typeof checkActor = checkActor
): Type<CanActivate> => {
  @Injectable()
  class RolesGuard implements CanActivate {
    constructor(
      @Inject(UserJourneyService)
      private readonly userJourneyService: UserJourneyService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context).getContext()
      const userId = get(ctx.headers, 'user-id')

      if (userId == null) return false

      const args = context.getArgByIndex(1)
      const journeyId = get(args, journeyIdArgName)
      if (journeyId == null)
        throw new AuthenticationError('No journeyId provided')

      const actor = await ca(this.userJourneyService, journeyId, userId)

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
