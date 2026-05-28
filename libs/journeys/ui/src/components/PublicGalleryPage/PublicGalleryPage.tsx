import { ReactElement } from 'react'

import { AdminView } from './AdminView'
import { JourneyView } from './JourneyView'

/**
 * Shared visual tokens for the public gallery page.
 *
 * `GALLERY_ACCENT` is the journeys-admin brand red (journeysAdmin palette
 * primary.main), hard-coded so the page keeps the admin accent regardless
 * of the active MUI theme.
 */
export const GALLERY_ACCENT = '#C52D3A'

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

/**
 * Which surface the page renders for:
 * - `journey` — the real full-screen page in the journeys app
 * - `admin`   — the compact recreation in the admin collection dialog
 */
export type PublicGalleryPageVariant = 'journey' | 'admin'

interface PublicGalleryPageProps {
  data: PublicGalleryPageData
  /**
   * Which surface to render:
   * - `journey` (default) — the real full-screen page in the journeys app
   * - `admin` — the compact recreation in the admin collection dialog
   */
  variant?: PublicGalleryPageVariant
}

export function PublicGalleryPage({
  data,
  variant = 'journey'
}: PublicGalleryPageProps): ReactElement {
  if (variant === 'admin') return <AdminView data={data} />
  return <JourneyView data={data} />
}
