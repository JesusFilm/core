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
  team: { include: { userTeams: true } },
  campaignRegionLanguages: { select: { id: true }, take: 1 }
} satisfies Prisma.QrCodeInclude

/**
 * Nobody manages a Campaign QR Code (one a campaign Share Language owns)
 * through the QR mutations: its Share Language owns the target, the colours
 * are fixed and the Share Language delete owns removal. Its `journeyId` is
 * the linked journey, which may belong to another team, so neither the team
 * nor that journey's owners and editors, nor a publisher on a template, get
 * rights over it.
 */
export function canManageQrCode(
  qrCode: {
    campaignRegionLanguages?: Array<{ id: string }>
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
  if (
    qrCode.campaignRegionLanguages != null &&
    qrCode.campaignRegionLanguages.length > 0
  )
    return false

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
