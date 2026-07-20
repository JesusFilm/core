import { Collision, useDndMonitor, useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, memo, useState } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { JourneyCard, JourneyCardSizer } from '../../JourneyList/JourneyCard'
import { COLLECTION_GRID_SPACING } from '../collectionLayout'

// Drop zone identity is encoded into a string the dnd-kit `over.id` carries
// back into the dispatcher. Wrappers use the encoder; the parent uses the
// decoder to route the drop.
export type DropZoneId =
  | { kind: 'unsectioned' }
  | { kind: 'collection'; id: string }

const UNSECTIONED_ID = 'unsectioned'
const COLLECTION_PREFIX = 'collection:'

export function encodeDropZoneId(zone: DropZoneId): string {
  return zone.kind === 'unsectioned'
    ? UNSECTIONED_ID
    : `${COLLECTION_PREFIX}${zone.id}`
}

export function parseDropZoneId(raw: string): DropZoneId | null {
  if (raw === UNSECTIONED_ID) return { kind: 'unsectioned' }
  if (raw.startsWith(COLLECTION_PREFIX)) {
    return { kind: 'collection', id: raw.slice(COLLECTION_PREFIX.length) }
  }
  return null
}

/**
 * The drop intent for a pointer position, decoded from the section under the
 * cursor and the dragged card's origin:
 *  - `reorder`  — the dragged card already belongs to the collection under the
 *    cursor; the caller should target the nearest card *within that collection*
 *    so the drop lands at a slot (works even when the cursor is in the gap
 *    between cards, where `pointerWithin` only sees the container).
 *  - `section`  — moving into a different section (or the unsectioned pool);
 *    the whole section is the drop zone, so target its container.
 *  - `passthrough` — the cursor isn't over any section container; the caller
 *    keeps the raw collision result.
 */
export type SectionDropResolution =
  | { kind: 'reorder'; collectionId: string }
  | { kind: 'section'; collision: Collision }
  | { kind: 'passthrough' }

/**
 * Decides, from the pointer collisions, how to target the gallery's nested
 * droppables so a whole collection acts as one drop zone without breaking
 * intra-collection reorder. Pure and dnd-kit-geometry-free so it's unit
 * testable; the caller runs the real collision strategies and applies the
 * decision (notably a collection-scoped `closestCenter` for `reorder`).
 *
 * Only pointer-derived collisions should be passed in. A drop in dead space
 * (cursor outside every droppable) must NOT be promoted to a section — that
 * would silently reassign membership on a missed drop — so the caller handles
 * the empty case before calling this.
 */
export function resolveSectionDrop(
  pointerCollisions: Collision[],
  activeId: string,
  templateIdToCollection: ReadonlyMap<string, { id: string }>
): SectionDropResolution {
  // The section container under the cursor (collection or unsectioned). Cards
  // carry raw journey ids, which parse to null.
  const sectionCollision = pointerCollisions.find(
    (collision) => parseDropZoneId(String(collision.id)) != null
  )
  if (sectionCollision == null) return { kind: 'passthrough' }

  const zone = parseDropZoneId(String(sectionCollision.id))
  const sectionCollectionId = zone?.kind === 'collection' ? zone.id : null
  const sourceCollectionId = templateIdToCollection.get(activeId)?.id ?? null

  // Dragging a card around its own collection → reorder within it.
  if (
    sectionCollectionId != null &&
    sectionCollectionId === sourceCollectionId
  ) {
    return { kind: 'reorder', collectionId: sectionCollectionId }
  }

  return { kind: 'section', collision: sectionCollision }
}

interface DroppableCollectionWrapperProps {
  id: string
  disabled: boolean
  children: ReactElement | ReactElement[]
}

function DroppableCollectionWrapperImpl({
  id,
  disabled,
  children
}: DroppableCollectionWrapperProps): ReactElement {
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id }),
    disabled
  })
  return (
    <Box
      ref={setNodeRef}
      sx={{
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        borderRadius: 1
      }}
    >
      {children}
    </Box>
  )
}

export const DroppableCollectionWrapper = memo(DroppableCollectionWrapperImpl)

interface DraggableJourneysGridProps {
  journeys: readonly Journey[]
  dragInFlight: boolean
  /**
   * NES-1703: when true a card-sized dashed placeholder tile always renders
   * after the cards — the collection's standing drop affordance. The
   * unsectioned pool omits it (dropping there is "remove", not "add").
   */
  showDropPlaceholder?: boolean
}

// One card slot — must stay identical between the real card tiles and the
// drop placeholder tile so the placeholder always occupies exactly one
// card's footprint.
const GRID_TILE_SIZE = { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }

/**
 * Always-visible drop affordance rendered as the last grid tile of a
 * collection (NES-1703). Purely visual — the whole collection is already
 * one droppable via DroppableCollectionWrapper, so a drop landing on this
 * tile routes through the section drop-zone like any other in-collection
 * drop. Lights up while a drag is active — tracked via useDndMonitor
 * (start/end/cancel events → local state) rather than a prop drilled from
 * the parent or useDndContext: the prop would bust every collection
 * grid's memo on drag start, and the context value is rebuilt on every
 * pointer-move tick. This way each tile re-renders exactly twice per
 * drag. Same pattern as the editor's DragItemWrapper.
 */
function DropPlaceholderTile(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [dragActive, setDragActive] = useState(false)
  useDndMonitor({
    onDragStart: () => setDragActive(true),
    onDragEnd: () => setDragActive(false),
    onDragCancel: () => setDragActive(false)
  })
  return (
    <Box
      data-testid="CollectionDropPlaceholder"
      sx={{
        position: 'relative',
        height: '100%',
        borderRadius: '12px',
        border: '2px dashed',
        // Neutral darkening while a drag is active — primary.main is red
        // in this theme, and every collection's placeholder lighting up
        // red at once was too loud.
        borderColor: dragActive ? 'text.secondary' : 'divider',
        color: dragActive ? 'text.secondary' : 'text.disabled',
        transition: 'border-color 0.2s ease, color 0.2s ease'
      }}
    >
      {/* Sizer mirroring JourneyCard's in-flow geometry so the tile's
          intrinsic height matches a real card — even when it's the only
          tile in an empty collection, where there's no row-mate to
          flex-stretch against. */}
      <JourneyCardSizer />
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ position: 'absolute', inset: 0 }}
      >
        <Plus2Icon fontSize="large" />
        <Typography variant="body2">{t('Drag templates here')}</Typography>
      </Stack>
    </Box>
  )
}

function DraggableJourneysGridImpl({
  journeys,
  dragInFlight,
  showDropPlaceholder = false
}: DraggableJourneysGridProps): ReactElement | null {
  if (journeys.length === 0 && !showDropPlaceholder) return null
  // SortableContext gives intra-collection ordering: each item is both a
  // draggable AND a drop target with a known index, so dnd-kit hands us
  // the over-item id in handleDragEnd.
  const ids = journeys.map((j) => j.id)
  // No outer padding: the grid sits directly in its container so the
  // in-collection grid and the All Templates grid share identical
  // geometry and their cards column-align (NES-1696). The card gap is
  // matched to the CollectionCard's inner padding via collectionLayout.
  return (
    <SortableContext items={ids} strategy={rectSortingStrategy}>
      <Grid container spacing={COLLECTION_GRID_SPACING}>
        {journeys.map((journey) => (
          <Grid key={journey.id} size={GRID_TILE_SIZE}>
            <DraggableJourney journey={journey} disabled={dragInFlight} />
          </Grid>
        ))}
        {showDropPlaceholder && (
          <Grid size={GRID_TILE_SIZE}>
            <DropPlaceholderTile />
          </Grid>
        )}
      </Grid>
    </SortableContext>
  )
}

export const DraggableJourneysGrid = memo(DraggableJourneysGridImpl)

interface UnsectionedDroppableProps {
  disabled: boolean
  children: ReactElement | ReactElement[]
}

// Drop target for the unsectioned pool — drops here unassign the template
// from its current collection (pageId: null in the assign mutation).
export function UnsectionedDroppable({
  disabled,
  children
}: UnsectionedDroppableProps): ReactElement {
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'unsectioned' }),
    disabled
  })
  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 100,
        // NES-1703: fill the gallery column's remaining height so the
        // unsectioned pool's drop target reaches the bottom of the page —
        // dropping "out of a collection" doesn't demand pixel accuracy on
        // the grid itself.
        flexGrow: 1,
        backgroundColor: (theme) => theme.palette.background.default,
        borderRadius: 1,
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.main'
      }}
    >
      {children}
    </Box>
  )
}

interface DraggableJourneyProps {
  journey: Journey
  disabled?: boolean
}

export function DraggableJourney({
  journey,
  disabled
}: DraggableJourneyProps): ReactElement {
  // useSortable plays the role useDraggable did before AND registers this
  // node as a drop target with its index inside the SortableContext, so
  // dnd-kit can hand us the over-item id in handleDragEnd.
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: journey.id, disabled })
  const style =
    transform != null
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined
  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'manipulation',
        cursor: disabled === true ? 'default' : isDragging ? 'grabbing' : 'grab'
      }}
    >
      <JourneyCard
        journey={journey}
        showDragAffordance={disabled === true ? undefined : 'hover'}
      />
    </Box>
  )
}
