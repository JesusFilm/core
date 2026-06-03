import { SxProps, Theme } from '@mui/material/styles'

/**
 * Shared `sx` prop fragments for the TemplateInfoPanel sections (NES-1538).
 *
 * The values map 1:1 to Figma tokens carried by frame `39653-66422` and its
 * siblings. Keeping them in one place means a token rev only touches this
 * file. Per-section overrides spread these and override what they need.
 */

/**
 * Open Sans Bold 14/22 (Editor/Secondary/Light grey) — in-body sub-headings
 * above template variants and sub-sections (e.g. "Quick-Start", "Regular",
 * "Links, Images, Video", "Text"). Derives from the `body2` variant (there is
 * no bold-14 variant) so its size tracks the body copy (NES-1696).
 */
export const subHeadingSx: SxProps<Theme> = (theme) => ({
  ...theme.typography.body2,
  fontWeight: 700,
  color: 'text.secondary'
})

/**
 * Decimal-style numbered list used for "do this, then this" step sequences.
 * The <li> elements borrow the `body2` variant via `sx` (a raw <li> can't
 * take a Typography `variant`).
 */
export const numberedListSx: SxProps<Theme> = (theme) => ({
  pl: 3,
  m: 0,
  listStyle: 'decimal',
  '& li': { ...theme.typography.body2, color: 'text.primary' }
})

/** Bullet-style list used for unordered enumerations inside a section body. */
export const bulletListSx: SxProps<Theme> = (theme) => ({
  pl: 3,
  m: 0,
  listStyle: 'disc',
  '& li': { ...theme.typography.body2, color: 'text.primary' }
})

/**
 * Visual chrome for an embedded screenshot or GIF slot in a section body.
 * 333px wide per Figma; heights vary by slot and are passed via `width`/
 * `height` props on the `<img>` itself rather than the container `sx`.
 */
export const mediaSlotSx: SxProps<Theme> = {
  width: 333,
  maxWidth: '100%',
  borderRadius: 1,
  border: '1px solid rgba(0, 0, 0, 0.07)',
  display: 'block'
}
