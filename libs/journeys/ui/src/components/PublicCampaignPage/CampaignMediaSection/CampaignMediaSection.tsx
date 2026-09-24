import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

import type { PublicGalleryPageMedia } from '../../PublicGalleryPage/galleryTokens'
import { JourneyViewMedia } from '../../PublicGalleryPage/JourneyView/JourneyViewMedia'
import { CampaignSectionLabel } from '../CampaignSectionLabel'
import { CAMPAIGN_SECTION_IDS } from '../campaignTokens'

interface CampaignMediaSectionProps {
  media?: PublicGalleryPageMedia | null
  /** Admin-supplied renderer for in-progress form state; takes precedence over `media`. */
  mediaSlot?: ReactNode
}

/** "Watch" section: the campaign's hero video (Mux upload or link embed). */
export function CampaignMediaSection({
  media,
  mediaSlot
}: CampaignMediaSectionProps): ReactElement | null {
  const { t } = useTranslation('libs-journeys-ui')
  if (mediaSlot == null && media == null) return null

  return (
    <Box
      component="section"
      id={CAMPAIGN_SECTION_IDS.media}
      data-testid="CampaignMediaSection"
    >
      <CampaignSectionLabel>{t('Watch')}</CampaignSectionLabel>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        {mediaSlot ?? <JourneyViewMedia media={media} />}
      </Box>
    </Box>
  )
}
