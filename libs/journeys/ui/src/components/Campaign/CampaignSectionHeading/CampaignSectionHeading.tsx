import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { flexAlign } from '../libs/flexAlign'
import { hasText } from '../types'

/** The lede's typography: muted, and larger from `md` up. The editor canvas styles its description with it too. */
export const CAMPAIGN_LEDE_SX = {
  color: 'var(--campaign-band-muted)',
  fontSize: { md: '1.25rem' }
} as const

interface CampaignSectionHeadingProps {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  titleVariant?: 'h1' | 'h2'
  align?: TypographyAlign | null
}

/**
 * The eyebrow / title / description trio most Section Bodies open with. An
 * empty field renders nothing; all three empty renders nothing at all. Line
 * breaks the author typed are kept.
 */
export function CampaignSectionHeading({
  eyebrow,
  title,
  description,
  titleVariant = 'h2',
  align = null
}: CampaignSectionHeadingProps): ReactElement | null {
  if (!hasText(eyebrow) && !hasText(title) && !hasText(description)) return null

  return (
    <Stack
      spacing={1.5}
      sx={{
        alignItems: flexAlign(align),
        textAlign: align ?? undefined
      }}
    >
      {hasText(eyebrow) && (
        <Typography
          variant="overline"
          component="p"
          data-testid="CampaignEyebrow"
          sx={{
            color: 'var(--campaign-band-eyebrow)',
            mb: 0,
            whiteSpace: 'pre-line'
          }}
        >
          {eyebrow}
        </Typography>
      )}
      {hasText(title) && (
        <Typography
          variant={titleVariant}
          data-testid="CampaignTitle"
          sx={{ color: 'var(--campaign-band-heading)', whiteSpace: 'pre-line' }}
        >
          {title}
        </Typography>
      )}
      {hasText(description) && (
        <Typography
          variant="body1"
          data-testid="CampaignDescription"
          sx={{ ...CAMPAIGN_LEDE_SX, whiteSpace: 'pre-line' }}
        >
          {description}
        </Typography>
      )}
    </Stack>
  )
}
