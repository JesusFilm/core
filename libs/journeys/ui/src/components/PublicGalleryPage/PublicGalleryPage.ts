/**
 * Shared data contract for the public template-collection gallery page.
 *
 * A "publish target" (the public journeys app) and the admin preview both
 * render this same shape. Keep this module free of React/MUI so it can be
 * imported as a pure type/constant contract from anywhere.
 */

/** Brand red used as the gallery accent (focus rings, fallback avatar, empty state). */
export const GALLERY_ACCENT = '#C52D3A'

/**
 * Corner radius (in theme spacing units, base = 4px → 12px) shared by the
 * gallery cards and the media block.
 */
export const GALLERY_CARD_RADIUS = 3

export interface PublicGalleryPageItem {
  id: string
  title: string
  description?: string | null
  slug: string
  /** ISO date string; rendered as a "Month Year" label when present. */
  createdAt?: string | null
  languageName?: ReadonlyArray<{ value: string; primary: boolean }>
  image?: { src: string | null; alt: string } | null
}

export interface PublicGalleryPageData {
  title: string
  description: string
  creatorName: string
  creatorImageSrc?: string | null
  creatorImageAlt?: string | null
  /** Optional hero/cover media — a Strategy embed slug or url. */
  mediaUrl?: string | null
  items: ReadonlyArray<PublicGalleryPageItem>
}
