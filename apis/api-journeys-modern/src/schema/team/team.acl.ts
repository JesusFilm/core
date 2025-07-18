import {
  Team as PrismaTeam,
  UserTeam,
  UserTeamRole
} from '.prisma/api-journeys-modern-client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

export interface Team extends PrismaTeam {
  userTeams: UserTeam[]
}

export interface User extends BaseUser {
  id: string
}

export function teamAcl(action: string, team: Team, user: User): boolean {
  const userTeam = team.userTeams.find((ut) => ut.userId === user.id)

  switch (action) {
    case 'create':
      // Any authenticated user can create teams
      return true
    case 'read':
      // User can read teams they're a member of
      return userTeam != null
    case 'update':
      // Only managers can update teams
      return userTeam?.role === UserTeamRole.manager
    case 'delete':
      // Only managers can delete teams
      return userTeam?.role === UserTeamRole.manager
    case 'manage':
      // Only managers can manage teams
      return userTeam?.role === UserTeamRole.manager
    default:
      return false
  }
}
