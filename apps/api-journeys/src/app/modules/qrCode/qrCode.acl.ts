import {
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-client'
import { DefaultArgs } from '@prisma/client/runtime/library'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const INCLUDE_QR_CODE_ACL: Prisma.QrCodeInclude<DefaultArgs> = {
  journey: {
    include: {
      userJourneys: true
    }
  },
  team: { include: { userTeams: true } }
}

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
