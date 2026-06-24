import { Prisma, UserTeamRole } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export type HostWithTeam = Prisma.HostGetPayload<{
  include: { team: { include: { userTeams: true } } }
}>

export const INCLUDE_HOST_ACL = {
  team: { include: { userTeams: true } }
} satisfies Prisma.HostInclude

export function hostAcl(host: HostWithTeam, user: User): boolean {
  const userTeam = host.team?.userTeams.find((ut) => ut.userId === user.id)
  if (userTeam == null) return false
  return (
    userTeam.role === UserTeamRole.manager ||
    userTeam.role === UserTeamRole.member
  )
}
