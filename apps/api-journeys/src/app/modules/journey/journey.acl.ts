import {
  UserTeamRole,
  UserJourneyRole,
  JourneyStatus
} from '.prisma/api-journeys-client'
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const journeyAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // TODO: remove when teams is released
  can(Action.Create, 'Journey', { teamId: 'jfp-team' })
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
  if (user.roles?.includes('publisher') === true) {
    // publisher can manage template
    can(Action.Manage, 'Journey', { template: true })
    // publisher can convert a journey to a template
    can(Action.Manage, 'Journey', 'template')
  }
}
