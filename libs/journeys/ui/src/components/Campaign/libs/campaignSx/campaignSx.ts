import type { SxProps, Theme } from '@mui/material/styles'

/** A plain style object: it spreads into another `sx`, unlike the array and function forms of `SxProps`. */
export type StyleObject = Exclude<
  SxProps<Theme>,
  ReadonlyArray<unknown> | ((theme: Theme) => unknown)
>

/** A card's chrome in the band: the band's card colour inside its border, with the theme's corner radius. */
export const campaignCardSx = {
  borderRadius: 1,
  backgroundColor: 'var(--campaign-band-card)',
  border: '1px solid var(--campaign-band-border)'
} as const satisfies StyleObject
