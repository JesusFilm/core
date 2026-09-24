import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { sanitiseAdminBase } from '../../../libs/adminTemplateLinks'
import type { PublicGalleryPageItem } from '../../PublicGalleryPage/galleryTokens'
import { JourneyViewCard } from '../../PublicGalleryPage/JourneyView/JourneyViewCard'
import { CampaignSectionLabel } from '../CampaignSectionLabel'
import {
  CAMPAIGN_SECTION_IDS,
  CAMPAIGN_TEXT,
  CAMPAIGN_TEXT_MUTED
} from '../campaignTokens'

interface CampaignTemplatesSectionProps {
  templates: ReadonlyArray<PublicGalleryPageItem>
  decorative?: boolean
}

/** "Collection" section: the template journeys a viewer can open and copy. */
export function CampaignTemplatesSection({
  templates,
  decorative = false
}: CampaignTemplatesSectionProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  // `||` so an explicitly-empty env var still falls back (see JourneyViewCardActions).
  const adminUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL || 'https://admin.nextstep.is'
  const templatesHref = `${sanitiseAdminBase(adminUrl)}/templates`

  return (
    <Box
      component="section"
      id={CAMPAIGN_SECTION_IDS.templates}
      data-testid="CampaignTemplatesSection"
    >
      <CampaignSectionLabel>
        {t('Collection · {{count}} journeys', { count: templates.length })}
      </CampaignSectionLabel>
      <Typography
        component="h2"
        sx={{
          color: CAMPAIGN_TEXT,
          fontWeight: 800,
          fontSize: decorative ? '1.5rem' : { xs: '1.75rem', md: '2.25rem' },
          mb: 4
        }}
      >
        {t('NextSteps journeys you can customize and use')}
      </Typography>
      {templates.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: decorative
              ? '1fr'
              : 'repeat(auto-fill, minmax(240px, 1fr))'
          }}
        >
          {templates.map((item) => (
            <JourneyViewCard
              key={item.id}
              item={item}
              variant="panel"
              decorative={decorative}
            />
          ))}
        </Box>
      ) : (
        <Typography sx={{ color: CAMPAIGN_TEXT_MUTED }}>
          {t('Templates added to this campaign will appear here.')}
        </Typography>
      )}
      <Stack sx={{ alignItems: 'center', mt: 5 }}>
        <Button
          variant="outlined"
          color="inherit"
          component="a"
          href={decorative ? undefined : templatesHref}
          target="_blank"
          rel="noopener noreferrer"
          disabled={decorative}
          data-testid="CampaignDiscoverTemplates"
        >
          {t('Discover more templates')}
        </Button>
      </Stack>
    </Box>
  )
}
