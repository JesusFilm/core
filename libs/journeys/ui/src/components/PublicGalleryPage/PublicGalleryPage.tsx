import { ReactElement } from 'react'

import { AdminView } from './AdminView'
import { PublicGalleryPageData } from './galleryTokens'
import { JourneyView } from './JourneyView'

/**
 * Re-export everything from the leaf so external consumers can keep
 * importing tokens, types, and `splitFeatured` from this entry point —
 * while every child view imports the leaf directly to keep the import
 * graph acyclic.
 */
export * from './galleryTokens'

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
