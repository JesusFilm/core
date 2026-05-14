import { SxProps, Theme } from '@mui/material/styles'

/**
 * Shared `sx` prop fragments for the TemplateInfoPanel sections (NES-1538).
 *
 * The values map 1:1 to Figma tokens carried by frame `39653-66422` and its
 * siblings. Keeping them in one place means a token rev only touches this
 * file. Per-section overrides spread these and override what they need.
 */

/** Open Sans Regular 16/24 — `Body/1` token used for paragraph copy. */
export const bodySx: SxProps<Theme> = {
  fontFamily: 'Open Sans, sans-serif',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: '24px',
  color: 'text.primary'
}

/**
 * Open Sans Bold 16/24 in the Editor/Secondary/Light grey — used for the
 * in-body sub-headings above template variants and sub-sections (e.g.
 * "Quick-Start", "Regular", "Links, Images, Video", "Text", "Canva",
 * "Google Slides", "Troubleshooting").
 */
export const subHeadingSx: SxProps<Theme> = {
  fontFamily: 'Open Sans, sans-serif',
  fontWeight: 700,
  fontSize: 16,
  lineHeight: '24px',
  color: '#6D6D7D'
}

const listItemSx: SxProps<Theme> = {
  fontFamily: 'Open Sans, sans-serif',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: '24px',
  color: 'text.primary'
}

/** Decimal-style numbered list used for "do this, then this" step sequences. */
export const numberedListSx: SxProps<Theme> = {
  pl: 3,
  m: 0,
  listStyle: 'decimal',
  '& li': listItemSx
}

/** Bullet-style list used for unordered enumerations inside a section body. */
export const bulletListSx: SxProps<Theme> = {
  pl: 3,
  m: 0,
  listStyle: 'disc',
  '& li': listItemSx
}

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
