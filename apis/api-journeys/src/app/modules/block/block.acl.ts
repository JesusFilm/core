import {
  JourneyStatus,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const blockAcl: AppAclFn = ({ can, cannot, user }: AppAclParameters) => {
  // manage block as a team manager or member
  can(Action.Manage, 'Block', {
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
  })
  // manage block as a journey owner or editor
  can(Action.Manage, 'Block', {
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
  })
  // read blocks on a published journey template
  can(Action.Read, 'Block', {
    journey: {
      is: {
        template: true,
        status: JourneyStatus.published
      }
    }
  })
  if (user.roles?.includes('publisher') === true) {
    can(Action.Manage, 'Block', { journey: { is: { teamId: 'jfp-team' } } })
    // publisher can manage blocks on any journey templates
    can(Action.Manage, 'Block', {
      journey: {
        is: {
          template: true
        }
      }
    })
  }
}
