import {
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

type User = BaseUser & { roles?: string[] }

export const INCLUDE_QR_CODE_ACL = {
  journey: {
    include: {
      userJourneys: true
    }
  },
  team: { include: { userTeams: true } }
} satisfies Prisma.QrCodeInclude

export function canManageQrCode(
  qrCode: {
    journey?: {
      template?: boolean | null
      userJourneys?: Array<{ userId: string; role: UserJourneyRole }>
    } | null
    team?: {
      userTeams: Array<{ userId: string; role: UserTeamRole }>
    } | null
  },
  user: User
): boolean {
  const isTeamManagerOrMember = qrCode.team?.userTeams.some(
    (ut) =>
      ut.userId === user.id &&
      (ut.role === UserTeamRole.manager || ut.role === UserTeamRole.member)
  )
  if (isTeamManagerOrMember === true) return true

  const isJourneyOwnerOrEditor = qrCode.journey?.userJourneys?.some(
    (uj) =>
      uj.userId === user.id &&
      (uj.role === UserJourneyRole.owner || uj.role === UserJourneyRole.editor)
  )
  if (isJourneyOwnerOrEditor === true) return true

  if (
    user.roles?.includes('publisher') === true &&
    qrCode.journey?.template === true
  )
    return true

  return false
}
