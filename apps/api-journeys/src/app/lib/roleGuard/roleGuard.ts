import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
  Inject
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { get, reduce } from 'lodash'
import { AuthenticationError } from 'apollo-server-errors'
import { UserJourneyService } from '../../modules/userJourney/userJourney.service'
import {
  Journey,
  JourneyStatus,
  Role,
  UserJourney,
  UserJourneyRole,
  UserRole
} from '../../__generated__/graphql'
import { UserRoleService } from '../../modules/userRole/userRole.service'
import { JourneyService } from '../../modules/journey/journey.service'

// broken out into function for test injection
export const fetchUserJourney = async (
  userJourneyService: UserJourneyService,
  journeyId: string,
  userId: string
): Promise<UserJourney> => {
  return await userJourneyService.forJourneyUser(journeyId, userId)
}

export const fetchUserRole = async (
  userRoleService: UserRoleService,
  journeyId: string
): Promise<UserRole> => {
  return await userRoleService.getUserRoleById(journeyId)
}

export const fetchJourney = async (
  journeyService: JourneyService,
  userId: string
): Promise<Journey> => {
  return await journeyService.get(userId)
}

type DefinedRole = UserJourneyRole | Role | PublicRole

interface CustomRole {
  role: DefinedRole | DefinedRole[]
  attributes?: Partial<Journey>
}

type Permission = DefinedRole | CustomRole

export type PublicRole = 'public'

export const RoleGuard = (
  journeyIdArgName: string,
  permissions: Permission[] | Permission,
  fuj: typeof fetchUserJourney = fetchUserJourney,
  fur: typeof fetchUserRole = fetchUserRole,
  fj: typeof fetchJourney = fetchJourney
): Type<CanActivate> => {
  @Injectable()
  class RolesGuard implements CanActivate {
    constructor(
      @Inject(UserJourneyService)
      private readonly userJourneyService: UserJourneyService,
      @Inject(UserRoleService)
      private readonly userRoleService: UserRoleService,
      @Inject(JourneyService)
      private readonly journeyService: JourneyService
    ) {}

    publicRole(permission: Permission): boolean {
      if (permission === 'public') return true
      return false
    }

    userJourneyRole(permission: Permission, userJourney: UserJourney): boolean {
      if (permission === userJourney.role) return true
      return false
    }

    userRole(permission: Permission, userRole: UserRole): boolean {
      const role = userRole.roles?.find((role) => role === Role.publisher)
      if (role == null) return false
      if (permission === role) return true
      return false
    }

    customRole(
      permission: Permission,
      journey: Journey,
      userJourney: UserJourney,
      userRole: UserRole
    ): boolean {
      const customRole = permission as CustomRole
      let userAccess

      if (Array.isArray(customRole.role)) {
        userAccess = reduce(
          customRole.role,
          (result, role) => {
            if (result) return true
            if (this.publicRole(role)) return true
            if (this.userJourneyRole(role, userJourney)) return true
            if (this.userRole(role, userRole)) return true
            return false
          },
          false
        )
      } else {
        userAccess =
          this.publicRole(customRole.role) ||
          this.userJourneyRole(customRole.role, userJourney) ||
          this.userRole(customRole.role, userRole)
      }
      // check if journey has attributes

      if (
        customRole.role === Role.publisher &&
        customRole.attributes ===
          { template: journey.template, status: journey.status }
      )
        return true

      if (
        customRole.role === 'public' &&
        customRole.attributes === { template: true }
      )
        return true

      if (userAccess === true && customRole.attributes === journey.template)
        return true
      return false
    }

    checkAllowedAccess(
      permissions: Permission[],
      journey: Journey,
      userJourney: UserJourney,
      userRole: UserRole
    ): boolean {
      return reduce(
        permissions,
        (result, permission) => {
          if (result) return true
          if (this.publicRole(permission)) return true
          if (this.userJourneyRole(permission, userJourney)) return true
          if (this.userRole(permission, userRole)) return true
          if (this.customRole(permission, journey, userJourney, userRole))
            return true
          return result
        },
        false
      )
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context).getContext()
      const userId = get(ctx.headers, 'user-id')

      if (userId == null) return false

      const args = context.getArgByIndex(1)
      const journeyId = get(args, journeyIdArgName)
      if (journeyId == null)
        throw new AuthenticationError('No journeyId provided')

      let result = false
      if (Array.isArray(journeyId)) {
        for (let i = 0; i < journeyId.length; i++) {
          const journey = await fj(this.journeyService, journeyId[i])
          const userRole = await fur(this.userRoleService, userId)
          const userJourney = await fuj(
            this.userJourneyService,
            journeyId[i],
            userId
          )

          const per = Array.isArray(permissions) ? permissions : [permissions]
          result = this.checkAllowedAccess(per, journey, userJourney, userRole)
          if (!result) break
        }
      } else {
        const userRole = await fur(this.userRoleService, userId)
        const journey = await fj(this.journeyService, journeyId)
        const userJourney = await fuj(
          this.userJourneyService,
          journeyId,
          userId
        )

        const per = Array.isArray(permissions) ? permissions : [permissions]
        result = this.checkAllowedAccess(per, journey, userJourney, userRole)
      }
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

// check permission is public
// return true

// check permission is user journey role
// return true if user has user journey role

// check permission is role
// return true if user has role

// check permission is custom role and journey has attributes
// if role is array for each the following
// check permission is public
// return true

// check permission is user journey role
// return true if user has user journey role

// check permission is role
// return true if user has role
