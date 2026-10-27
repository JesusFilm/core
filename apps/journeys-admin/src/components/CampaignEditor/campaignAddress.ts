import { previewEmbedUrl } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../__generated__/GetCampaign'

const JOURNEYS_URL =
  process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

/**
 * The root-domain Campaign Address: `/campaign/<slug>` on the root domain.
 * It serves only a campaign with no Campaign Domain; once one is added it is
 * not found.
 */
export function campaignPermanentAddress(slug: string): string {
  return `${JOURNEYS_URL}/campaign/${slug}`
}

/**
 * The address the public page is served at right now: the Campaign Domain's
 * root when the campaign has one, else the root-domain address.
 */
export function campaignPublicAddress(
  slug: string,
  hostname: string | null
): string {
  if (hostname != null && hostname !== '') return `https://${hostname}`
  return campaignPermanentAddress(slug)
}

/**
 * Every address the public page is served at right now: the Campaign Domain
 * alone when the campaign has one, else the root-domain address.
 */
export function campaignPublicAddresses(
  slug: string,
  hostnames: string[]
): string[] {
  const addresses = hostnames
    .filter((hostname) => hostname !== '')
    .map((hostname) => `https://${hostname}`)
  return addresses.length > 0 ? addresses : [campaignPermanentAddress(slug)]
}

/** The preview frame's address for a linked journey: the root-domain embed route, kept a preview. */
export function journeyPreviewAddress(slug: string): string {
  return previewEmbedUrl(`${JOURNEYS_URL}/embed/${slug}`)
}

/** The Share Link a Campaign QR Code encodes, as the admin reads it through the short link. */
export function campaignShareLink(
  qrCode: Pick<CampaignRegionLanguage, 'qrCode'>['qrCode']
): string | undefined {
  if (qrCode == null) return undefined
  return `https://${qrCode.shortLink.domain.hostname}/${qrCode.shortLink.pathname}`
}
