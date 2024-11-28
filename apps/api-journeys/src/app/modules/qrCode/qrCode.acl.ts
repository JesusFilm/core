import { UserJourneyRole, UserTeamRole } from '.prisma/api-journeys-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const qrCodeAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // manage QrCode as a team manager or member
  can(Action.Manage, 'QrCode', {
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

  // read and update journey as a journey editor
  can([Action.Read, Action.Update], 'QrCode', {
    journey: {
      is: {
        userJourneys: {
          some: {
            userId: user.id,
            role: UserJourneyRole.editor
          }
        }
      }
    }
  })

  if (user.roles?.includes('publisher') === true) {
    // publisher can mange QrCodes for templates
    can(Action.Manage, 'QrCode', {
      journey: {
        is: {
          template: true
        }
      }
    })
  }
}
