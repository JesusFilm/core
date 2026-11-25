import type { CSSObject } from '@mui/material/styles'

/**
 * A contained button filled with `fill` and lettered in `label`, which
 * darkens on hover rather than switching to the theme's primary.
 */
export function containedButtonSx(
  fill: string | undefined,
  label: string | undefined
): CSSObject {
  return {
    backgroundColor: fill,
    color: label,
    '&:hover': { backgroundColor: fill, filter: 'brightness(0.92)' }
  }
}

/** The band-coloured contained button: the band's button colour and its label colour. */
export const bandButtonSx: CSSObject = containedButtonSx(
  'var(--campaign-band-button)',
  'var(--campaign-band-button-label)'
)
