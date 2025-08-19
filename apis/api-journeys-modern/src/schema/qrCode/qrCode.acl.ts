import {
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

export interface User extends BaseUser {
  roles?: string[]
}

export type QrCode = Prisma.QrCodeGetPayload<{
  include: {
    journey: {
      include: {
        userJourneys: true
      }
    }
    team: {
      include: { userTeams: true }
    }
  }
}>

export const INCLUDE_QR_CODE_ACL: Prisma.QrCodeInclude = {
  journey: {
    include: {
      userJourneys: true
    }
  },
  team: { include: { userTeams: true } }
}

export function qrCodeAcl(action: Action, qrCode: QrCode, user: User): boolean {
  // Check team permissions - managers and members can manage QR codes
  const userTeam = qrCode.team.userTeams.find((ut) => ut.userId === user.id)
  if (
    userTeam &&
    [UserTeamRole.manager, UserTeamRole.member].includes(userTeam.role)
  ) {
    return true
  }

  // Check journey permissions - owners and editors can manage QR codes
  const userJourney = qrCode.journey.userJourneys.find(
    (uj) => uj.userId === user.id
  )
  if (
    userJourney &&
    (userJourney.role === UserJourneyRole.owner ||
      userJourney.role === UserJourneyRole.editor)
  ) {
    return true
  }

  // Publishers can manage QR codes for templates
  if (
    user.roles?.includes('publisher') === true &&
    qrCode.journey.template === true
  ) {
    return true
  }

  return false
}
