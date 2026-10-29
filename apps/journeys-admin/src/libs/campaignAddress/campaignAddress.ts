import { previewEmbedUrl } from '@core/journeys/ui/Campaign'
import {
  campaignAbsoluteAddress,
  campaignDomainName as domainNameOf
} from '@core/journeys/ui/Campaign/libs/campaignAddress'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../__generated__/GetCampaign'

// Public addresses a visitor's browser opens, so NEXT_PUBLIC_JOURNEYS_URL;
// server-to-server calls use JOURNEYS_URL (see pages/api/campaign/open.ts).
const JOURNEYS_URL =
  process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

/**
 * The root-domain Campaign Address: `/campaign/<slug>` on the root domain.
 * It serves only a campaign with no Campaign Domain; once one is added it is
 * not found.
 */
export function campaignPermanentAddress(slug: string): string {
  return campaignAbsoluteAddress(
    { slug, domainName: null },
    { rootOrigin: JOURNEYS_URL }
  )
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
  return domainNameOf(customDomains.map(({ name }) => name))
}

/**
 * The address the public page is served at right now, or the page of the
 * region `regionSlug` names: on the Campaign Domain when the campaign has
 * one, else on the root domain. A Campaign Domain's landing page is shown
 * and opened as its bare origin, without the module's trailing `/`.
 */
export function campaignPublicAddress(
  campaign: CampaignAddressFields,
  regionSlug?: string | null
): string {
  const address = campaignAbsoluteAddress(
    {
      slug: campaign.slug,
      domainName: campaignDomainName(campaign.customDomains)
    },
    { rootOrigin: JOURNEYS_URL },
    regionSlug
  )
  return address.endsWith('/') ? address.slice(0, -1) : address
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
