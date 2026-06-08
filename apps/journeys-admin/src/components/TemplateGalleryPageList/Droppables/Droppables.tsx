import { Collision, useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { ReactElement, memo } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { JourneyCard } from '../../JourneyList/JourneyCard'
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
 * Makes a whole section (a collection, or the unsectioned pool) a single drop
 * zone. dnd-kit's pointer/closest collision returns the specific card under
 * the cursor first, but the gallery's intent when the cursor is anywhere
 * inside a section is "drop into this section" — so a card hit is remapped to
 * its enclosing section container, which also drives the section's drop
 * highlight. The one exception is reordering within the same section: when the
 * dragged card already belongs to the section under the cursor, the specific
 * card is kept as the target so the drop lands at that position.
 *
 * Pure and dnd-kit-geometry-free so it's unit-testable: the caller runs the
 * real collision strategy, this just rewrites the result.
 */
export function resolveSectionDropCollisions(
  collisions: Collision[],
  activeId: string,
  templateIdToCollection: ReadonlyMap<string, { id: string }>
): Collision[] {
  if (collisions.length === 0) return collisions
  // A section container present anywhere under the cursor (collection or
  // unsectioned). Cards have raw journey ids, which parse to null.
  const sectionCollision = collisions.find(
    (collision) => parseDropZoneId(String(collision.id)) != null
  )
  if (sectionCollision == null) return collisions

  const topId = String(collisions[0].id)
  const topIsCard = parseDropZoneId(topId) == null
  if (topIsCard) {
    const sourceCollectionId = templateIdToCollection.get(activeId)?.id ?? null
    const cardCollectionId = templateIdToCollection.get(topId)?.id ?? null
    // Same-collection drag over one of its own cards → keep the card so the
    // existing reorder path fires for that slot. (Both null = unsectioned over
    // unsectioned, which is a no-op downstream either way.)
    if (cardCollectionId != null && cardCollectionId === sourceCollectionId) {
      return collisions
    }
  }
  return [sectionCollision]
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
  publishedLock: boolean
  dragInFlight: boolean
}

function DraggableJourneysGridImpl({
  journeys,
  publishedLock,
  dragInFlight
}: DraggableJourneysGridProps): ReactElement | null {
  if (journeys.length === 0) return null
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
          <Grid key={journey.id} size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}>
            <DraggableJourney
              journey={journey}
              disabled={publishedLock || dragInFlight}
            />
          </Grid>
        ))}
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
      <JourneyCard journey={journey} />
    </Box>
  )
}
