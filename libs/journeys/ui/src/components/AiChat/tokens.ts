/**
 * Chat-only design tokens lifted from the Claude Design handoff bundle.
 * Greys + inputFill match `libs/shared/ui/src/libs/themes/base/tokens/*`
 * (the journeyUi theme re-exports them unchanged). brandRed is the
 * journeysAdmin primary — there's no shared journeys token for it, so we
 * keep it local to the chat surface.
 */

export const PRIMARY = '#6D6F81' // grey.700 — user bubble + send button fill
export const PRIMARY_ON = '#FFFFFF' // grey.0 — text on primary
export const ASSISTANT_BG = '#DCDDE5' // grey.200 — assistant bubble
export const ASSISTANT_FG = '#26262E' // grey.900 — text on assistant
export const SURFACE = '#FFFFFF' // grey.0 — pinned-bar surface
export const TEXT_SECONDARY = '#6D6F81' // grey.700
export const DIVIDER = '#DCDDE5' // grey.200
export const INPUT_FILL = 'rgba(173, 173, 173, 0.3)'

export const BRAND_RED = '#C52D3A'
export const BRAND_RED_DARK = '#A8202C'

export const SHEET_TOP_SHADOW =
  '0 -8px 24px rgba(38,38,46,0.12), 0 -1px 0 rgba(38,38,46,0.04)'
export const SPARKLE_AVATAR_SHADOW =
  '0 2px 8px rgba(197,45,58,0.35), inset 0 1px 0 rgba(255,255,255,0.18)'
export const HEADER_WASH =
  'linear-gradient(180deg, rgba(197,45,58,0.06) 0%, rgba(197,45,58,0) 100%)'
export const SPARKLE_GRADIENT = `linear-gradient(135deg, ${BRAND_RED} 0%, ${BRAND_RED_DARK} 100%)`
