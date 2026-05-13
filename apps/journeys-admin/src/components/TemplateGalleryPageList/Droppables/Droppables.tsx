import { useDroppable } from '@dnd-kit/core'
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
  /**
   * Optional callback forwarded to each `JourneyCard`'s trash flow.
   * Used by the parent collection card to fire a revalidate when one
   * of its templates is trashed from inside a published collection
   * (NES-1644 / QA C). Opaque pass-through.
   */
  onTrashSuccess?: () => void
}

function DraggableJourneysGridImpl({
  journeys,
  publishedLock,
  dragInFlight,
  onTrashSuccess
}: DraggableJourneysGridProps): ReactElement | null {
  if (journeys.length === 0) return null
  // SortableContext gives intra-collection ordering: each item is both a
  // draggable AND a drop target with a known index, so dnd-kit hands us
  // the over-item id in handleDragEnd.
  const ids = journeys.map((j) => j.id)
  return (
    <SortableContext items={ids} strategy={rectSortingStrategy}>
      {/* Outer padding matches the Grid's spacing/rowSpacing so the gap
          between a card and the collection edge equals the gap between
          two cards — Sushma flagged the inconsistent 8px-vs-32px in DM. */}
      <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
          {journeys.map((journey) => (
            <Grid
              key={journey.id}
              size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}
            >
              <DraggableJourney
                journey={journey}
                disabled={publishedLock || dragInFlight}
                onTrashSuccess={onTrashSuccess}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
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
  /** Forwarded to the inner `JourneyCard`. See DraggableJourneysGrid. */
  onTrashSuccess?: () => void
}

export function DraggableJourney({
  journey,
  disabled,
  onTrashSuccess
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
      <JourneyCard journey={journey} onTrashSuccess={onTrashSuccess} />
    </Box>
  )
}
