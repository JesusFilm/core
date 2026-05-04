import { brandRed } from '@core/shared/ui/themes/base/tokens/colors'

/**
 * Chat-only visual constants — gradients, shadows, and colour values
 * that don't have a home in the shared journeyUi theme. Greys, white,
 * dividers, and the brand red itself live in the MUI theme; consumers
 * read those via `theme.palette.grey[N]` / `theme.palette.common.white`
 * rather than re-exported aliases.
 */

/** Second stop of the sparkle-avatar gradient. Darker than journeysAdmin's primary.dark, tuned to the gradient. */
export const BRAND_RED_DARK = '#A8202C'

/** Translucent grey fill behind the disabled-state input pill in the loading skeleton. */
export const INPUT_FILL = 'rgba(173, 173, 173, 0.3)'

/** Top-edge drop shadow for the pinned chat sheet. */
export const SHEET_TOP_SHADOW =
  '0 -8px 24px rgba(38,38,46,0.12), 0 -1px 0 rgba(38,38,46,0.04)'

/** Outer red glow + inner highlight on the sparkle avatar circle. */
export const SPARKLE_AVATAR_SHADOW =
  '0 2px 8px rgba(197,45,58,0.35), inset 0 1px 0 rgba(255,255,255,0.18)'

/** Faint red wash behind the chat header. */
export const HEADER_WASH =
  'linear-gradient(180deg, rgba(197,45,58,0.06) 0%, rgba(197,45,58,0) 100%)'

/** Sparkle-avatar fill — brand red shaded toward BRAND_RED_DARK. */
export const SPARKLE_GRADIENT = `linear-gradient(135deg, ${brandRed} 0%, ${BRAND_RED_DARK} 100%)`
