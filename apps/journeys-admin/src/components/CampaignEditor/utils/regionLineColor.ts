import { isHeadingVariant } from '@core/journeys/ui/Campaign'

import { TypographyVariant } from '../../../../__generated__/globalTypes'

/**
 * A Region Line's colour on the canvas: its own, else the band's heading
 * colour for a heading variant and its text colour for the rest, as the
 * public page resolves it.
 */
export function regionLineColor(
  color: string | null,
  variant: TypographyVariant
): string {
  if (color != null) return color
  return isHeadingVariant(variant)
    ? 'var(--campaign-band-heading)'
    : 'var(--campaign-band-text)'
}
