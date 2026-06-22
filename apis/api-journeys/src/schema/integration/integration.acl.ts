import { Prisma, UserTeamRole } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export type IntegrationWithTeam = Prisma.IntegrationGetPayload<{
  include: { team: { include: { userTeams: true } } }
}>

export const INCLUDE_INTEGRATION_ACL = {
  team: { include: { userTeams: true } }
} satisfies Prisma.IntegrationInclude

export function integrationAcl(
  integration: IntegrationWithTeam,
  user: User
): boolean {
  const userTeam = integration.team?.userTeams.find(
    (ut) => ut.userId === user.id
  )
  if (userTeam == null) return false
  return (
    userTeam.role === UserTeamRole.manager ||
    userTeam.role === UserTeamRole.member
  )
}
