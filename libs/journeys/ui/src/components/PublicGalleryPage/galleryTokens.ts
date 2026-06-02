import { brandRed } from '@core/shared/ui/themes/base/tokens/colors'

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

export interface PublicGalleryPageData {
  title: string
  description: string
  creatorName: string
  creatorImageSrc?: string | null
  creatorImageAlt?: string | null
  /** Optional hero/cover media (a Strategy embed slug/url). */
  mediaUrl?: string | null
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
