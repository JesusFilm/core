import {
  JourneyStatus,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'

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
}
