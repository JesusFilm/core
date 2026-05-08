import { brandRed } from '@core/shared/ui/themes/base/tokens/colors'

/**
 * Single source of truth for chat-surface styling. Consumers
 * (`Message`, `ChatHeader`, `DragHandle`, `PromptInput`,
 * `Conversation`, `PinnedChatBar`, `AiChat`) import from here
 * instead of inlining colour/shadow values in `sx` blocks — so a
 * design tweak only touches one file.
 *
 * Solid colours are MUI theme paths (`'grey.700'`, `'common.white'`)
 * — they resolve through `theme.palette` at render time, so no
 * hex value is duplicated against the shared palette. Translucent
 * overlays, gradients, and shadows are concrete strings since they
 * have no home in the MUI theme.
 */

// --- Theme-path aliases (resolved by MUI's sx string-form) ---

/** User bubble bg + active send-button fill (= theme.palette.grey[700]). */
export const PRIMARY = 'grey.700'
/** Text / icon colour on the primary fill (= theme.palette.common.white). */
export const PRIMARY_ON = 'common.white'
/** Assistant bubble bg (= theme.palette.grey[200]). */
export const ASSISTANT_BG = 'grey.200'
/** Assistant text colour (= theme.palette.grey[900]). */
export const ASSISTANT_FG = 'grey.900'
/** Sheet / pill surface (= theme.palette.common.white). */
export const SURFACE = 'common.white'
/** Secondary text + drag-thumb active state (= theme.palette.grey[700]). */
export const TEXT_SECONDARY = 'grey.700'
/** Border / drag-thumb idle / skeleton fill (= theme.palette.grey[200]). */
export const DIVIDER = 'grey.200'
/**
 * MUI's built-in muted foreground (= theme.palette.text.secondary).
 * Used for the typing-dot indicator and the panel retry button.
 * Distinct from `TEXT_SECONDARY`, which is the chat design system's
 * specific grey.700 caption colour.
 */
export const MUTED_FG = 'text.secondary'

// --- Brand ---

/** Brand red (= journeysAdmin primary.main) — active send button fill. */
export const BRAND_RED = brandRed

/** Hover state for the brand-red send button. */
export const BRAND_RED_HOVER = '#A8202C'

/** Second stop of the sparkle-avatar gradient. Darker than journeysAdmin's primary.dark, tuned to the gradient. */
export const BRAND_RED_DARK = '#A8202C'

/** Sparkle-avatar fill — brand red shaded toward BRAND_RED_DARK. */
export const SPARKLE_GRADIENT = `linear-gradient(135deg, ${brandRed} 0%, ${BRAND_RED_DARK} 100%)`

/** Faint red wash behind the chat header. */
export const HEADER_WASH =
  'linear-gradient(180deg, rgba(197,45,58,0.06) 0%, rgba(197,45,58,0) 100%)'

/** Outer red glow + inner highlight on the sparkle avatar circle. */
export const SPARKLE_AVATAR_SHADOW =
  '0 2px 8px rgba(197,45,58,0.35), inset 0 1px 0 rgba(255,255,255,0.18)'

// --- Pinned sheet ---

/** Top-edge drop shadow for the pinned chat sheet. */
export const SHEET_TOP_SHADOW =
  '0 -8px 24px rgba(38,38,46,0.12), 0 -1px 0 rgba(38,38,46,0.04)'

/** Translucent grey fill behind the disabled-state input pill in the loading skeleton. */
export const INPUT_FILL = 'rgba(173, 173, 173, 0.3)'

// --- PromptInput, panel (inline) variant — floating pill on the white pinned-bar surface ---

export const PANEL_INPUT_BG = 'rgba(255, 255, 255, 0.96)'
export const PANEL_INPUT_BORDER = 'rgba(38, 38, 46, 0.12)'
export const PANEL_INPUT_SHADOW =
  '0 6px 18px rgba(38, 38, 46, 0.16), 0 1px 3px rgba(38, 38, 46, 0.10)'

// --- PromptInput, overlay (floating) variant — floating pill on the dark journey backdrop ---

export const OVERLAY_INPUT_BG = 'rgba(38, 38, 46, 0.78)'
export const OVERLAY_INPUT_BORDER = 'rgba(255, 255, 255, 0.12)'
export const OVERLAY_INPUT_SHADOW =
  '0 10px 30px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.1)'
/** Muted text on the dark overlay (placeholder, disabled label). */
export const OVERLAY_FG_MUTED = 'rgba(255, 255, 255, 0.6)'
/** Subtle white wash on the dark overlay (disabled button bg). */
export const OVERLAY_FILL_LOW = 'rgba(255, 255, 255, 0.18)'
/** Muted brand-red close control on the dark overlay. */
export const OVERLAY_CLOSE_BG = 'rgba(197, 45, 58, 0.72)'
/** Hover state for the muted brand-red close control. */
export const OVERLAY_CLOSE_BG_HOVER = 'rgba(197, 45, 58, 0.86)'

// --- Misc chat surfaces ---

/** Plain assistant text on the dark blurred overlay backdrop. */
export const PLAIN_ASSISTANT_FG_ON_DARK = 'rgba(255, 255, 255, 0.92)'

/** Dim text colour for the retry button on the dark overlay. */
export const OVERLAY_FG_RETRY = 'rgba(255, 255, 255, 0.7)'

/** Drop shadow on the floating "scroll to latest" pill in Conversation. */
export const SCROLL_PILL_SHADOW = '0 4px 12px rgba(38, 38, 46, 0.12)'

/** Conversation scrollbar thumb (default state). */
export const SCROLLBAR_THUMB = 'rgba(128, 128, 128, 0.5)'

/** Conversation scrollbar thumb (hover). */
export const SCROLLBAR_THUMB_HOVER = 'rgba(128, 128, 128, 0.7)'

/** Bottom-edge fade overlaid on the panel sheet so messages dissolve under the floating capsule. */
export const SHEET_BOTTOM_FADE =
  'linear-gradient(to bottom, rgba(38, 38, 46, 0) 0%, rgba(38, 38, 46, 0.04) 50%, rgba(38, 38, 46, 0.08) 100%)'
