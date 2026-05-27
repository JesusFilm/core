import {
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export type UserJourneyWithAcl = Prisma.UserJourneyGetPayload<{
  include: {
    journey: {
      include: {
        team: { include: { userTeams: true } }
        userJourneys: true
      }
    }
  }
}>

export const INCLUDE_USER_JOURNEY_ACL = {
  journey: {
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  }
} satisfies Prisma.UserJourneyInclude

export enum UserJourneyAction {
  Create = 'create',
  UpdateRole = 'updateRole',
  UpdateOpenedAt = 'updateOpenedAt',
  Delete = 'delete'
}

export function userJourneyAcl(
  action: UserJourneyAction,
  userJourney: UserJourneyWithAcl,
  user: User
): boolean {
  const journey = userJourney.journey

  const callerUserJourney = journey?.userJourneys?.find(
    (uj) => uj.userId === user.id
  )
  const callerUserTeam = journey?.team?.userTeams.find(
    (ut) => ut.userId === user.id
  )

  const isOwner = callerUserJourney?.role === UserJourneyRole.owner
  const isTeamManager = callerUserTeam?.role === UserTeamRole.manager

  switch (action) {
    case UserJourneyAction.Create:
      return userJourney.userId === user.id &&
        userJourney.role === UserJourneyRole.inviteRequested
    case UserJourneyAction.UpdateRole:
      return isOwner || isTeamManager
    case UserJourneyAction.UpdateOpenedAt:
      return userJourney.userId === user.id
    case UserJourneyAction.Delete:
      return isOwner || isTeamManager
    default:
      return false
  }
}

export function userJourneyDeleteAccessWhere(
  userId: string
): Prisma.UserJourneyWhereInput {
  return {
    OR: [
      {
        journey: {
          is: {
            team: {
              is: {
                userTeams: {
                  some: { userId, role: UserTeamRole.manager }
                }
              }
            }
          }
        }
      },
      {
        journey: {
          is: {
            userJourneys: {
              some: { userId, role: UserJourneyRole.owner }
            }
          }
        }
      }
    ]
  }
}
