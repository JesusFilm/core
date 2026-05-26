import { ReactElement } from 'react'

import { AdminView } from './AdminView'
import { JourneyView } from './JourneyView'
import {
  PublicGalleryPageData,
  PublicGalleryPageVariant
} from './publicGalleryPageData'

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
