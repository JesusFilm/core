import { Injectable } from '@nestjs/common'
import { PureAbility, AbilityBuilder } from '@casl/ability'
import { UserTeamRole } from '.prisma/api-journeys-client'
import { CaslFactory } from '@core/nest/common/CaslAuthModule'
import { createPrismaAbility, PrismaQuery } from './caslPrisma'
import { PrismaSubjects } from './__generated__/prismaSubjects'

export enum Action {
  Manage = 'manage',
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete'
}

type ExtendedSubjects = 'all'
export type AppSubjects = PrismaSubjects | ExtendedSubjects
export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>

@Injectable()
export class AppCaslFactory extends CaslFactory {
  async createAbility(user: { id: string }): Promise<AppAbility> {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    can(Action.Create, 'Team')
    can(Action.Read, 'Team', {
      userTeams: {
        some: {
          userId: user.id,
          role: { in: [UserTeamRole.manager, UserTeamRole.member] }
        }
      }
    })
    can(Action.Update, 'Team', {
      userTeams: {
        some: {
          userId: user.id,
          role: UserTeamRole.manager
        }
      }
    })
    can(Action.Manage, 'UserTeam', {
      team: {
        is: {
          userTeams: {
            some: { userId: user.id, role: UserTeamRole.manager }
          }
        }
      }
    })
    can(Action.Read, 'UserTeam', {
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
    })
    can(Action.Manage, 'Host', {
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
    })
    can(Action.Read, 'Host', {
      team: {
        is: {
          userTeams: {
            some: { userId: user.id }
          }
        }
      }
    })
    return build()
  }
}
