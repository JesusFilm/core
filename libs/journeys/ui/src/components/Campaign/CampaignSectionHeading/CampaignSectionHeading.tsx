import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { hasText } from '../types'

interface CampaignSectionHeadingProps {
  eyebrow?: string | null
  title?: string | null
  lede?: string | null
  titleVariant?: 'h1' | 'h2'
  align?: TypographyAlign | null
}

/**
 * The eyebrow / title / lede trio most Section Bodies open with. An empty
 * field renders nothing; all three empty renders nothing at all.
 */
export function CampaignSectionHeading({
  eyebrow,
  title,
  lede,
  titleVariant = 'h2',
  align = null
}: CampaignSectionHeadingProps): ReactElement | null {
  if (!hasText(eyebrow) && !hasText(title) && !hasText(lede)) return null

  return (
    <Stack
      spacing={1.5}
      sx={{
        alignItems:
          align === TypographyAlign.center
            ? 'center'
            : align === TypographyAlign.right
              ? 'flex-end'
              : 'flex-start',
        textAlign: align ?? undefined
      }}
    >
      {hasText(eyebrow) && (
        <Typography
          variant="overline"
          component="p"
          data-testid="CampaignEyebrow"
          sx={{ color: 'var(--campaign-band-eyebrow)', mb: 0 }}
        >
          {eyebrow}
        </Typography>
      )}
      {hasText(title) && (
        <Typography
          variant={titleVariant}
          data-testid="CampaignTitle"
          sx={{ color: 'var(--campaign-band-heading)' }}
        >
          {title}
        </Typography>
      )}
      {hasText(lede) && (
        <Typography
          variant="body1"
          data-testid="CampaignLede"
          sx={{
            color: 'var(--campaign-band-muted)',
            fontSize: { md: '1.25rem' },
            maxWidth: 720
          }}
        >
          {lede}
        </Typography>
      )}
    </Stack>
  )
}
