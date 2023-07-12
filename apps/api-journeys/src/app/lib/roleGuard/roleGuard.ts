import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
  Type
} from '@nestjs/common'
import { get, includes, reduce } from 'lodash'
import { GraphQLError } from 'graphql'
import { contextToUserId } from '@core/nest/common/firebaseClient'
import {
  Journey,
  Role,
  UserJourney,
  UserJourneyRole,
  UserRole
} from '.prisma/api-journeys-client'
import { UserRoleService } from '../../modules/userRole/userRole.service'
import { PrismaService } from '../prisma.service'

// broken out into function for test injection
export const fetchUserJourney = async (
  prismaService: PrismaService,
  journeyId: string,
  userId: string
): Promise<UserJourney | null> => {
  return await prismaService.userJourney.findUnique({
    where: { journeyId_userId: { journeyId, userId } }
  })
}

export const fetchUserRole = async (
  userRoleService: UserRoleService,
  journeyId: string
): Promise<UserRole> => {
  return await userRoleService.getUserRoleById(journeyId)
}

export const fetchJourney = async (
  prismaService: PrismaService,
  id: string
): Promise<Journey | null> => {
  return await prismaService.journey.findUnique({ where: { id } })
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
      private readonly userRoleService: UserRoleService,
      private readonly prismaService: PrismaService
    ) {}

    checkAttributes(journey: Journey, attributes?: Partial<Journey>): boolean {
      if (attributes == null || Object.keys(attributes).length === 0)
        return true
      return Object.keys(attributes).every(
        (key: string) => attributes[key] === journey[key]
      )
    }

    publicRole(permission: Permission): boolean {
      return permission === 'public'
    }

    userJourneyRole(permission: Permission, userJourney: UserJourney): boolean {
      return (
        permission !== UserJourneyRole.inviteRequested &&
        permission === userJourney.role
      )
    }

    userRole(permission: Permission, userRole: UserRole): boolean {
      return includes(userRole.roles, permission) ?? false
    }

    checkAllowedAccess(
      permissions: Permission[],
      journey: Journey | null,
      userJourney: UserJourney | null,
      userRole: UserRole,
      attributes?: Partial<Journey>
    ): boolean {
      return reduce(
        permissions,
        (result, permission) => {
          if (result) return true

          if (
            this.publicRole(permission) &&
            journey != null &&
            this.checkAttributes(journey, attributes)
          )
            return true

          if (
            userJourney != null &&
            this.userJourneyRole(permission, userJourney) &&
            journey != null &&
            this.checkAttributes(journey, attributes)
          )
            return true

          if (
            this.userRole(permission, userRole) &&
            journey != null &&
            this.checkAttributes(journey, attributes)
          )
            return true

          const customRole = (permission as CustomRole)?.role
          if (
            customRole != null &&
            this.checkAllowedAccess(
              Array.isArray(customRole) ? customRole : [customRole],
              journey,
              userJourney,
              userRole,
              (permission as CustomRole).attributes
            )
          )
            return true
          return false
        },
        false
      )
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const userId = await contextToUserId(context)

      if (userId == null) return false

      const args = context.getArgByIndex(1)
      const journeyId = get(args, journeyIdArgName)
      if (journeyId == null)
        throw new GraphQLError('No journeyId provided', {
          extensions: { code: 'BAD_USER_INPUT' }
        })

      const userRole = await fur(this.userRoleService, userId)

      const access = Array.isArray(permissions) ? permissions : [permissions]
      const journeyIds = Array.isArray(journeyId) ? journeyId : [journeyId]

      let result = false
      for (const journeyId of journeyIds) {
        const journey = await fj(this.prismaService, journeyId)
        const userJourney = await fuj(this.prismaService, journeyId, userId)

        result = this.checkAllowedAccess(access, journey, userJourney, userRole)
      }

      if (!result)
        throw new GraphQLError(
          'User does not have the role to perform this action',
          { extensions: { code: 'FORBIDDEN' } }
        )
      return result
    }
  }
  const guard = mixin(RolesGuard)
  return guard
}
