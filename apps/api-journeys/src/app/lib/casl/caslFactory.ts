import { Injectable } from '@nestjs/common'
import { PureAbility, AbilityBuilder } from '@casl/ability'
import {
  UserTeamRole,
  UserJourneyRole,
  Role
} from '.prisma/api-journeys-client'
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
export class AppCaslFactory extends CaslFactory<Role> {
  async createAbility(user: {
    id: string
    roles?: Role[]
  }): Promise<AppAbility> {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)
    console.log('roles', user.roles)

    can(Action.Create, 'Team')
    can(Action.Read, 'Team', {
      userTeams: {
        some: {
          userId: user.id,
          role: { in: [UserTeamRole.manager, UserTeamRole.member] }
        }
      }
    })
    can(Action.Manage, 'Team', {
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
    can(Action.Manage, 'UserTeamInvite', {
      removedAt: null,
      acceptedAt: null,
      team: {
        is: {
          userTeams: {
            some: { userId: user.id, role: UserTeamRole.manager }
          }
        }
      }
    })
    can(Action.Read, 'UserTeamInvite', {
      removedAt: null,
      acceptedAt: null,
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
              role: {
                in: [
                  UserTeamRole.manager,
                  UserTeamRole.member,
                  UserTeamRole.guest // remove UserTeamRole.guest in the future to restrict roles
                ]
              }
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
    can(Action.Manage, 'Journey', {
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
    can(Action.Manage, 'Journey', {
      userJourneys: {
        some: {
          userId: user.id,
          role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
        }
      }
    })
    return build()
  }
}
