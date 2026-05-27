import {
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export type UserInviteWithJourneyAcl = Prisma.UserInviteGetPayload<{
  include: {
    journey: {
      include: {
        team: { include: { userTeams: true } }
        userJourneys: true
      }
    }
  }
}>

export const INCLUDE_USER_INVITE_JOURNEY_ACL = {
  journey: {
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  }
} satisfies Prisma.UserInviteInclude

export enum UserInviteAction {
  Create = 'create',
  Manage = 'manage',
  Read = 'read'
}

export function userInviteAcl(
  action: UserInviteAction,
  userInvite: UserInviteWithJourneyAcl,
  user: User
): boolean {
  const journey = userInvite.journey

  const userJourney = journey?.userJourneys?.find(
    (uj) => uj.userId === user.id
  )
  const userTeam = journey?.team?.userTeams.find(
    (ut) => ut.userId === user.id
  )

  const isOwner = userJourney?.role === UserJourneyRole.owner
  const isEditor = userJourney?.role === UserJourneyRole.editor
  const isTeamManager = userTeam?.role === UserTeamRole.manager
  const isTeamMember = userTeam?.role === UserTeamRole.member

  switch (action) {
    case UserInviteAction.Create:
      return isOwner || isEditor || isTeamManager || isTeamMember
    case UserInviteAction.Manage:
      return isOwner || isEditor || isTeamManager || isTeamMember
    case UserInviteAction.Read:
      return isOwner || isEditor || isTeamManager || isTeamMember
    default:
      return false
  }
}

export function userInviteReadAccessWhere(
  user: User
): Prisma.UserInviteWhereInput {
  return {
    OR: [
      {
        journey: {
          is: {
            team: {
              is: {
                userTeams: {
                  some: {
                    userId: user.id,
                    role: { in: [UserTeamRole.manager, UserTeamRole.member] }
                  }
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
              some: {
                userId: user.id,
                role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
              }
            }
          }
        }
      }
    ]
  }
}
