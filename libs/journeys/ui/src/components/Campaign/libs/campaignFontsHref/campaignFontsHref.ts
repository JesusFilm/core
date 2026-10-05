/** The fonts every campaign page loads, as `home/[journeySlug].tsx` does. */
export const CAMPAIGN_DEFAULT_FONTS = ['Montserrat', 'Open Sans', 'El Messiri']

const FONT_WEIGHTS = '400;500;600;700;800'

export interface CampaignFonts {
  headerFont: string | null
  bodyFont: string | null
  labelFont: string | null
}

function formatFontName(font: string): string {
  return font.trim().replace(/ /g, '+')
}

/**
 * The Google Fonts stylesheet href for a campaign, built exactly as the root
 * journey route builds it: the defaults plus the three theme fonts, each with
 * weights 400–800, deduplicated and sorted, `display=swap`. Null fonts add
 * nothing, so a theme with no fonts set loads the defaults only.
 */
export function campaignFontsHref(fonts: CampaignFonts | null | undefined): string {
  const families = [
    ...CAMPAIGN_DEFAULT_FONTS,
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
