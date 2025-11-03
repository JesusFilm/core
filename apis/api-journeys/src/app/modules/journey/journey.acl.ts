import {
  JourneyStatus,
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const INCLUDE_JOURNEY_ACL: Prisma.BlockInclude<DefaultArgs> = {
  journey: {
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  }
}

export const journeyAcl: AppAclFn = ({
  can,
  cannot,
  user
}: AppAclParameters) => {
  // create journey as a team member
  can(Action.Create, 'Journey', {
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
  // manage journey as a team manager
  can(Action.Manage, 'Journey', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: UserTeamRole.manager
          }
        }
      }
    }
  })
  // manage journey as a journey owner
  can(Action.Manage, 'Journey', {
    userJourneys: {
      some: {
        userId: user.id,
        role: UserJourneyRole.owner
      }
    }
  })
  // read and update journey as a team member
  can([Action.Read, Action.Update], 'Journey', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: UserTeamRole.member
          }
        }
      }
    }
  })
  // read and update journey as a journey editor
  can([Action.Read, Action.Update], 'Journey', {
    userJourneys: {
      some: {
        userId: user.id,
        role: UserJourneyRole.editor
      }
    }
  })
  // read published journey template
  can(Action.Read, 'Journey', {
    template: true,
    status: JourneyStatus.published
  })
  cannot(Action.Manage, 'Journey', 'template')
  if (user.roles?.includes('publisher') === true) {
    can(Action.Create, 'Journey', { teamId: 'jfp-team' })

    // publisher can manage template
    can(Action.Manage, 'Journey', { template: true })
    // publisher can convert journey to template as a journey owner/editor
    can(Action.Manage, 'Journey', 'template', {
      userJourneys: {
        some: {
          userId: user.id,
          role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
        }
      }
    })
    // publisher can convert journey to template as a team manager/member
    can(Action.Manage, 'Journey', 'template', {
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
  }
}
