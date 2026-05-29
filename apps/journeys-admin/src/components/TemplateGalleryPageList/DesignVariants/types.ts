import type { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import type { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'

export type { Journey, TemplateGalleryPage }

/**
 * Props passed to the new desktop folder-based view (PublishHero).
 * Variants own their own full layout (collection picker + template list +
 * empty state) so the parent only has to render `<PublishHero {...props} />`;
 * the standard template grid is reused via `DraggableJourneysGrid` from
 * `Droppables/`.
 */
export interface CollectionViewProps {
  /** All collections to display. */
  collections: readonly TemplateGalleryPage[]
  /** Total number of active templates across all collections + unsectioned. */
  allTemplatesCount: number
  /** Currently-selected collection id; `null` = "All Templates" filter. */
  selectedCollectionId: string | null
  /** Called when the user picks a collection (`null` selects All Templates). */
  onSelectCollection: (id: string | null) => void
  /**
   * When true, all drop targets are disabled — used while a previous
   * mutation is in flight or a dialog is open.
   */
  dropDisabled: boolean
  /** Templates matching the current filter (the parent computes this). */
  filteredJourneys: readonly Journey[]
  /** The currently-selected collection (`null` when All Templates is active). */
  selectedCollection: TemplateGalleryPage | null
  /** Drag-in-flight flag forwarded to `DraggableJourneysGrid`. */
  dragInFlight: boolean
  /** Edit a specific collection (opens the edit dialog). */
  onEdit: (collection: TemplateGalleryPage) => void
  /** Open the publish flow for a specific collection. */
  onOpenPublish: (collection: TemplateGalleryPage) => void
  /** Ungroup a specific collection (templates move to unsectioned). */
  onUngroup: (collection: TemplateGalleryPage) => void
  /** ID of the collection whose mutation is currently in flight, or null. */
  busyId: string | null
  /** Whether the active collection can be published. */
  canPublish: boolean
  /** Localized reason the active collection cannot be published, or null. */
  publishBlockedReason: string | null
}
