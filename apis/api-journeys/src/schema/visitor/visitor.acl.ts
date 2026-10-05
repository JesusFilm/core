import {
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export type VisitorWithAcl = Prisma.VisitorGetPayload<{
  include: {
    team: { include: { userTeams: true } }
    journeyVisitors: {
      include: { journey: { include: { userJourneys: true } } }
    }
  }
}>

export const INCLUDE_VISITOR_ACL = {
  team: { include: { userTeams: true } },
  journeyVisitors: {
    include: { journey: { include: { userJourneys: true } } }
  }
} satisfies Prisma.VisitorInclude

export function visitorAcl(visitor: VisitorWithAcl, user: User): boolean {
  if (visitor.userId === user.id) return true

  const isTeamMember = visitor.team?.userTeams.some(
    (ut) =>
      ut.userId === user.id &&
      (ut.role === UserTeamRole.manager || ut.role === UserTeamRole.member)
  )
  if (isTeamMember === true) return true

  const isJourneyOwnerOrEditor = visitor.journeyVisitors?.some((jv) =>
    jv.journey?.userJourneys?.some(
      (uj) =>
        uj.userId === user.id &&
        (uj.role === UserJourneyRole.owner ||
          uj.role === UserJourneyRole.editor)
    )
  )
  if (isJourneyOwnerOrEditor === true) return true

  return false
}
