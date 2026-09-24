import Box from '@mui/material/Box'
import { ReactElement, useMemo } from 'react'

import {
  PublicCampaignPage,
  PublicCampaignPageData
} from '@core/journeys/ui/PublicCampaignPage'
import type { PublicGalleryPageMedia } from '@core/journeys/ui/PublicGalleryPage'

import {
  GetCampaign_campaignBySlug as Campaign,
  GetCampaign_campaignCountryStats as CampaignCountryStats,
  GetCampaign_campaignBySlug_media as CampaignMedia
} from '../../../__generated__/GetCampaign'
import { TemplateGalleryPageMediaType } from '../../../__generated__/globalTypes'

interface CampaignViewProps {
  campaign: Campaign
  /** Null when the stats query failed or the campaign is unpublished. */
  countryStats: CampaignCountryStats | null
}

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'your.nextstep.is'

/** Rows missing a payload map to null so a broken player/iframe never mounts. */
function toMedia(media: CampaignMedia | null): PublicGalleryPageMedia | null {
  if (media == null) return null
  if (media.type === TemplateGalleryPageMediaType.mux) {
    if (media.muxPlaybackId == null || media.muxPlaybackId === '') return null
    return { type: 'mux', muxPlaybackId: media.muxPlaybackId }
  }
  if (media.embedUrl == null || media.embedUrl === '') return null
  return { type: 'link', embedUrl: media.embedUrl }
}

export function toCampaignData(
  campaign: Campaign,
  countryStats: CampaignCountryStats | null
): PublicCampaignPageData {
  return {
    title: campaign.title,
    eyebrow: campaign.eyebrow,
    tagline: campaign.tagline,
    description: campaign.description,
    backgroundImageSrc: campaign.backgroundImageSrc,
    backgroundImageAlt: campaign.backgroundImageAlt,
    media: toMedia(campaign.media),
    shareJourneys: campaign.shareJourneys.map((journey) => ({
      id: journey.id,
      slug: journey.slug,
      title: journey.title,
      language: {
        id: journey.language.id,
        bcp47: journey.language.bcp47,
        name: journey.language.name
      }
    })),
    templates: campaign.templateJourneys.map((template) => ({
      id: template.id,
      title: template.title,
      description: template.description,
      slug: template.slug,
      customizable: template.customizable,
      createdAt: template.createdAt != null ? String(template.createdAt) : null,
      languageName: template.language.name,
      image:
        template.primaryImageBlock != null
          ? {
              src: template.primaryImageBlock.src,
              alt: template.primaryImageBlock.alt
            }
          : null
    })),
    countryStats:
      countryStats != null
        ? {
            totalVisitors: countryStats.totalVisitors,
            countries: countryStats.countries.map((country) => ({
              countryCode: country.countryCode,
              countryName: country.countryName,
              visitors: country.visitors
            }))
          }
        : null,
    publicOrigin: `https://${ROOT_DOMAIN}`
  }
}

export function CampaignView({
  campaign,
  countryStats
}: CampaignViewProps): ReactElement {
  const data = useMemo(
    () => toCampaignData(campaign, countryStats),
    [campaign, countryStats]
  )
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <PublicCampaignPage variant="journey" data={data} />
    </Box>
  )
}
