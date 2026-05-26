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

/**
 * Which surface the page renders for:
 * - `journey` — the real full-screen page in the journeys app
 * - `admin`   — the compact recreation in the admin collection dialog
 */
export type PublicGalleryPageVariant = 'journey' | 'admin'
