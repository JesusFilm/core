import MuiTypography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { TypographyVariant } from '../../../../__generated__/globalTypes'
import { useCampaignSection } from '../CampaignSectionBand'
import { hasText } from '../types'
import type { CampaignBlockOf } from '../types'

interface CampaignTypographyProps {
  block: CampaignBlockOf<'CampaignTypographyBlock'>
}

// Overline and caption are inline by MUI default; campaign text is always a block.
const PARAGRAPH_VARIANTS = { overline: 'p', caption: 'p' }

const HEADING_VARIANTS = new Set<TypographyVariant>([
  TypographyVariant.h1,
  TypographyVariant.h2,
  TypographyVariant.h3,
  TypographyVariant.h4,
  TypographyVariant.h5,
  TypographyVariant.h6
])

/**
 * The campaign text block. `variant` decides size, weight and font family
 * through the theme (null ⇒ body1); a null `align` inherits the section's;
 * a null `color` falls to the section's resolved text (its override, then the
 * theme). Empty content renders nothing.
 */
export function CampaignTypography({
  block
}: CampaignTypographyProps): ReactElement | null {
  const section = useCampaignSection()
  if (!hasText(block.content)) return null

  const variant = block.typographyVariant ?? TypographyVariant.body1
  const sectionColor =
    section == null
      ? undefined
      : HEADING_VARIANTS.has(variant)
        ? section.band.heading
        : section.band.text
  return (
    <MuiTypography
      variant={variant}
      variantMapping={PARAGRAPH_VARIANTS}
      align={block.align ?? undefined}
      data-testid="CampaignTypography"
      sx={{
        color: block.color ?? sectionColor,
        whiteSpace: 'pre-line',
        wordBreak: 'break-word'
      }}
    >
      {block.content}
    </MuiTypography>
  )
}
