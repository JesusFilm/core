import { QrCode } from '@core/prisma/journeys/client'

/** A QR code row, with the Share Languages holding it when a query includes them. */
export type QrCodeRow = QrCode & {
  campaignRegionLanguages?: Array<{ id: string }>
}

/** A journey QR code row pointing at `journeyId`. */
export function qrCodeRow(overrides: Partial<QrCodeRow> = {}): QrCodeRow {
  return {
    id: 'qrCodeId',
    teamId: 'teamId',
    journeyId: 'journeyId',
    toJourneyId: 'journeyId',
    toBlockId: null,
    shortLinkId: 'shortLinkId',
    shortLinkUrl: null,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    ...overrides
  }
}

/** The journey row `getTo` reads, with its team's custom domains. */
export interface JourneyRow {
  id: string
  slug: string
  teamId: string
  team: {
    id: string
    customDomains: Array<{ name: string; routeAllTeamJourneys: boolean }>
  }
  journeyCollectionJourneys: []
}

/** A journey row as `getTo` reads it. */
export function journeyRow(
  overrides: {
    id?: string
    slug?: string
    customDomains?: Array<{ name: string; routeAllTeamJourneys: boolean }>
  } = {}
): JourneyRow {
  return {
    id: overrides.id ?? 'journeyId',
    slug: overrides.slug ?? 'my-journey',
    teamId: 'teamId',
    team: { id: 'teamId', customDomains: overrides.customDomains ?? [] },
    journeyCollectionJourneys: []
  }
}
