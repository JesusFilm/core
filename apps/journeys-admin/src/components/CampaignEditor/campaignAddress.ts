import { previewEmbedUrl } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../__generated__/GetCampaign'

const JOURNEYS_URL =
  process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

/** The permanent Campaign Address: `/campaign/<slug>` on the root domain, reachable on every host. */
export function campaignPermanentAddress(slug: string): string {
  return `${JOURNEYS_URL}/campaign/${slug}`
}

/**
 * The address the public page is served at right now: the Custom Domain root
 * when one names the campaign as Campaign Root, else the permanent address.
 */
export function campaignPublicAddress(
  slug: string,
  hostname: string | null
): string {
  if (hostname != null && hostname !== '') return `https://${hostname}`
  return campaignPermanentAddress(slug)
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
