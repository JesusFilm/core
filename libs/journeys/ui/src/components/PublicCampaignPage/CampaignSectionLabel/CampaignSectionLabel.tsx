import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import { CAMPAIGN_ACCENT } from '../campaignTokens'

interface CampaignSectionLabelProps {
  children: ReactNode
}

/** Accent bar + red overline that opens every section of the campaign page. */
export function CampaignSectionLabel({
  children
}: CampaignSectionLabelProps): ReactElement {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          width: 28,
          height: 3,
          borderRadius: 1,
          backgroundColor: CAMPAIGN_ACCENT
        }}
      />
      <Typography
        variant="overline"
        sx={{
          color: CAMPAIGN_ACCENT,
          fontWeight: 700,
          letterSpacing: '0.2em'
        }}
      >
        {children}
      </Typography>
    </Stack>
  )
}
