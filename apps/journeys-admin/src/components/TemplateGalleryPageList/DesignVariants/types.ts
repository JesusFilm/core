import type { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import type { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'

export type { Journey, TemplateGalleryPage }

/**
 * Identifier for the active design variant in the templates panel.
 * `original` is the production chip-row layout already in place; the others
 * are exploration prototypes that each present collections in a different
 * way so the team can compare folder-system patterns side-by-side
 * (NES-1695 design lab).
 */
export type DesignVariant =
  | 'original'
  | 'folderGrid'
  | 'librarySidebar'
  | 'publishPipeline'
  | 'publishPriority'
  | 'publishHero'

/** Ordered list of variants used for the tab strip + array indexing. */
export const DESIGN_VARIANTS: readonly DesignVariant[] = [
  'original',
  'folderGrid',
  'librarySidebar',
  'publishPipeline',
  'publishPriority',
  'publishHero'
] as const

/** Human-readable labels for the design-variant tabs. */
export const VARIANT_LABELS: Record<DesignVariant, string> = {
  original: 'Original',
  folderGrid: 'Folder Grid',
  librarySidebar: 'Library Sidebar',
  publishPipeline: 'Publish Pipeline',
  publishPriority: 'Publish Priority',
  publishHero: 'Publish Hero'
}

/**
 * Props passed to every design-variant component. Variants own their own
 * full layout (collection picker + template list + empty state) so the
 * parent only has to render `<Variant {...props} />` — variants that need
 * the standard template grid reuse `DraggableJourneysGrid` from the
 * `Droppables/` module.
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
