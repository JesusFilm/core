import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import type { CampaignTreeOf } from '../types'

interface CampaignAnalyticsProps {
  block: CampaignTreeOf<'CampaignAnalyticsBlock'>
}

/**
 * The Analytics section always renders: eyebrow and title over the skeleton
 * state (two tiles and a ranked list) until the stats ticket fetches
 * `campaignStats` client-side.
 */
export function CampaignAnalytics({
  block
}: CampaignAnalyticsProps): ReactElement {
  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading eyebrow={block.eyebrow} title={block.title} />
      <Box
        data-testid="CampaignAnalyticsSkeleton"
        aria-busy="true"
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          '& .MuiSkeleton-root': { bgcolor: 'var(--campaign-band-card)' }
        }}
      >
        <Skeleton variant="rounded" height={112} />
        <Skeleton variant="rounded" height={112} />
        <Stack spacing={1.5} sx={{ gridColumn: '1 / -1' }}>
          <Skeleton variant="rounded" height={28} />
          <Skeleton variant="rounded" height={28} width="80%" />
          <Skeleton variant="rounded" height={28} width="60%" />
        </Stack>
      </Box>
    </CampaignSectionBand>
  )
}
