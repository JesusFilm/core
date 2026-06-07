import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { intlFormat, isValid, parseISO } from 'date-fns'

import { brandRed } from '@core/shared/ui/themes/base/tokens/colors'

import { abbreviateLanguageName } from '../../libs/abbreviateLanguageName'

/**
 * Shared visual tokens, view-model types, and the featured/rest split rule
 * for the public gallery page.
 *
 * This module is a **leaf** in the import graph: it imports nothing from
 * the component tree (`PublicGalleryPage.tsx`, `JourneyView/*`,
 * `AdminView/*`). The variant entry component and every child view import
 * from this leaf instead of from each other's parent, so there is no
 * parent↔child cycle. See the architecture-pattern doc
 * `docs/solutions/architecture-patterns/shared-cross-app-view-component-2026-05-26.md`
 * for the rationale — "leaf module" is the cycle-free alternative described
 * there.
 */

/**
 * `GALLERY_ACCENT` reuses the project-wide `brandRed` token so the page
 * keeps a single source of truth for the brand colour, independent of the
 * active MUI theme.
 */
export const GALLERY_ACCENT = brandRed

/** Corner radius (theme spacing units) for gallery card images. */
export const GALLERY_CARD_RADIUS = 3

/** Height of the fixed desktop section-nav bar; sections offset their scroll target by it. */
export const GALLERY_NAV_HEIGHT = 56

/** Shared height of the Use / Preview action controls so the row aligns. */
export const GALLERY_ACTION_SIZE = 40

/**
 * Minimum width of the outlined "Use" button when it sits next to the Play
 * icon button (Explore section, and the decorative admin look-alike). Keeps
 * the label visually weighted against the surrounding type.
 */
export const GALLERY_USE_BUTTON_MIN_WIDTH = 180

/**
 * Glass-surface sx fragment: translucent tint + backdrop blur (with the
 * `WebkitBackdropFilter` fallback for Safari/iOS). Applied to the desktop
 * nav bar, the mobile hamburger button, and the mobile drawer's Paper so
 * the three surfaces stay in lockstep. Plain callback form (not
 * `SxProps<Theme>`) so it composes inside MUI's `sx={[fragment, {...}]}`
 * array form — `SxProps<Theme>` is the outer-array type, not the inner
 * element type, so typing it that way breaks array composition.
 */
export const galleryGlassSx = (theme: Theme) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.6),
  backdropFilter: 'saturate(180%) blur(8px)',
  WebkitBackdropFilter: 'saturate(180%) blur(8px)'
})

/**
 * Multi-line clamp sx fragment — the `-webkit-line-clamp` recipe used by
 * the More cards and the Explore featured rows' descriptions to cap long
 * copy at `lines` lines with an ellipsis. Spread into a Typography `sx`.
 */
export const clampLines = (lines: number) =>
  ({
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden'
  }) as const

/**
 * Neutral view-model for the public gallery (template-collection) page,
 * shared by the live public page (`apps/journeys`) and the admin dialog
 * preview (`apps/journeys-admin`). Each app maps its own generated
 * GraphQL types into this shape so the two surfaces render from one
 * source of truth and stay in sync.
 */
export interface PublicGalleryPageItem {
  id: string
  title: string
  description?: string | null
  slug: string
  /** ISO timestamp; used to derive the "Month Year" meta label. */
  createdAt?: string | null
  /** Language name entries (primary + local) used for the meta label. */
  languageName?: ReadonlyArray<{ value: string; primary: boolean }>
  image?: { src: string | null; alt: string } | null
}

/**
 * Embedded media shown in the page's media section. Tagged union mirroring
 * the API's TemplateGalleryPageMedia: `mux` renders an HLS player from the
 * denormalized playback ID; `link` renders the server-normalized embed URL
 * in a host-aware iframe (see `EmbedIframe`). Each app maps its generated
 * GraphQL media type into this neutral shape.
 */
export type PublicGalleryPageMedia =
  | { type: 'mux'; muxPlaybackId: string }
  | { type: 'link'; embedUrl: string }

export interface PublicGalleryPageData {
  title: string
  description: string
  creatorName: string
  creatorImageSrc?: string | null
  creatorImageAlt?: string | null
  /** Optional embedded media; null/omitted hides the media section. */
  media?: PublicGalleryPageMedia | null
  items: ReadonlyArray<PublicGalleryPageItem>
}

/** Default number of items featured in the "Explore" section. */
export const FEATURED_COUNT = 2

export interface SplitFeaturedItems {
  featured: ReadonlyArray<PublicGalleryPageItem>
  rest: ReadonlyArray<PublicGalleryPageItem>
}

/**
 * Shared split rule for the gallery's "Explore" lead-in vs the "More" grid.
 * Default is the first two items featured, the rest in the grid — but with
 * exactly three items feature all three, so the "More" grid is never left
 * with a single bare card. Both the live `JourneyView` and the `AdminView`
 * preview must split identically; centralising the rule here prevents the
 * derived-logic drift that surfaced in NES-1694.
 */
export function splitFeatured(
  items: ReadonlyArray<PublicGalleryPageItem>
): SplitFeaturedItems {
  const featuredCount = items.length === 3 ? 3 : FEATURED_COUNT
  return {
    featured: items.slice(0, featuredCount),
    rest: items.slice(featuredCount)
  }
}

/**
 * Derive the small "Month Year · Language" caption line above a card's
 * title. Returns an empty string when neither part is available — a sibling
 * helper to `splitFeatured` so any derivation of `PublicGalleryPageItem`
 * lives in the leaf module and can't drift between child views.
 */
export function metaLine(item: PublicGalleryPageItem): string {
  const names = item.languageName ?? []
  const localLanguage = names.find(({ primary }) => !primary)?.value
  const nativeLanguage = names.find(({ primary }) => primary)?.value ?? ''
  const displayLanguage = abbreviateLanguageName(
    localLanguage ?? nativeLanguage
  )

  // String-coerce defensively: a custom DateTime scalar or a Date slipping
  // in here would make parseISO return Invalid Date and silently drop the
  // meta-line date.
  const parsedCreatedAt =
    item.createdAt != null ? parseISO(String(item.createdAt)) : null
  const date =
    parsedCreatedAt != null && isValid(parsedCreatedAt)
      ? intlFormat(parsedCreatedAt, { month: 'long', year: 'numeric' })
      : null

  return [date, displayLanguage]
    .filter((part): part is string => part != null && part !== '')
    .join(' · ')
}
