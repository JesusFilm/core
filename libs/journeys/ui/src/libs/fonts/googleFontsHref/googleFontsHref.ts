/** The fonts every campaign page and root-domain journey page load. */
export const DEFAULT_GOOGLE_FONTS = ['Montserrat', 'Open Sans', 'El Messiri']

const FONT_WEIGHTS = '400;500;600;700;800'

export interface GoogleFonts {
  headerFont: string | null
  bodyFont: string | null
  labelFont: string | null
}

function formatFontName(font: string): string {
  return font.trim().replace(/ /g, '+')
}

/**
 * The Google Fonts stylesheet href for a campaign or journey theme: the
 * defaults plus the three theme fonts, each with weights 400–800,
 * deduplicated and sorted, `display=swap`. Null fonts add
 * nothing, so a theme with no fonts set loads the defaults only.
 */
export function googleFontsHref(fonts: GoogleFonts | null | undefined): string {
  const families = [
    ...DEFAULT_GOOGLE_FONTS,
    fonts?.headerFont ?? '',
    fonts?.bodyFont ?? '',
    fonts?.labelFont ?? ''
  ]
  const unique = [...new Set(families.filter((font) => font !== ''))].sort()
  const fontsParam = unique
    .map((font) => `family=${formatFontName(font)}:wght@${FONT_WEIGHTS}`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${fontsParam}&display=swap`
}
