// Sarabun is appended after the Latin fonts in every font stack as a
// unicode-range-scoped Thai fallback: Latin glyphs keep resolving to
// Montserrat/Open Sans while Thai glyphs fall through to Sarabun, and the
// Sarabun Thai .woff2 only downloads when Thai glyphs actually render.
export const THAI_FALLBACK_FONT = '"Sarabun"'

// Weight list must be a superset of every fontWeight used across the
// base/journeyUi/journeysAdmin typography tokens (400, 500, 600, 700, 800),
// otherwise the browser synthesizes missing Thai weights.
export const SARABUN_FONTS_QUERY = 'family=Sarabun:wght@400;500;600;700;800'

// Google Fonts families always loaded by the iframe portal and the standalone
// journey page, merged with any author-selected fonts.
export const DEFAULT_FONTS = [
  'Montserrat',
  'Open Sans',
  'El Messiri',
  'Sarabun'
]
