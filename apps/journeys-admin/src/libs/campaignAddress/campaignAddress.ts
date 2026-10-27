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

/** What a campaign's public address is read from. */
export interface CampaignAddressFields {
  slug: string
  customDomains: ReadonlyArray<{ name: string }>
}

/**
 * The name of the campaign's Campaign Domain, or null when it has none (an
 * empty name counts as none). A campaign has at most one domain, so
 * `customDomains` holds zero or one.
 */
export function campaignDomainName(
  customDomains: CampaignAddressFields['customDomains']
): string | null {
  const name = customDomains[0]?.name
  if (name == null || name === '') return null
  return name
}

/**
 * The address the public page is served at right now: the Campaign Domain's
 * root when the campaign has one, else the root-domain address.
 */
export function campaignPublicAddress(campaign: CampaignAddressFields): string {
  const domainName = campaignDomainName(campaign.customDomains)
  if (domainName == null) return campaignPermanentAddress(campaign.slug)
  return `https://${domainName}`
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
