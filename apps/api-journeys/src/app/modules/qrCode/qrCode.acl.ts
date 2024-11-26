import { UserJourneyRole, UserTeamRole } from '.prisma/api-journeys-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const qrCodeAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // create QrCode as a team manager or member
  can(Action.Manage, 'QrCode', {
    Team: {
      userTeams: {
        some: {
          userId: user.id,
          role: { in: [UserTeamRole.manager, UserTeamRole.member] }
        }
      }
    }
  })

  // read and update journey as a journey editor
  can([Action.Read, Action.Update], 'QrCode', {
    journey: {
      userJourneys: {
        some: {
          userId: user.id,
          role: UserJourneyRole.editor
        }
      }
    }
  })

  if (user.roles?.includes('publisher') === true) {
    // publisher can mange QrCodes for templates
    can(Action.Manage, 'QrCode', {
      journey: {
        template: true
      }
    })
  }
}
