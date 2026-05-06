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

export function parseDropZoneId(raw: string | number): DropZoneId | null {
  const value = String(raw)
  if (value === UNSECTIONED_ID) return { kind: 'unsectioned' }
  if (value.startsWith(COLLECTION_PREFIX)) {
    return { kind: 'collection', id: value.slice(COLLECTION_PREFIX.length) }
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
  return (
    <SortableContext items={ids} strategy={rectSortingStrategy}>
      <Box sx={{ mt: -1, p: 1 }}>
        <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
          {journeys.map((journey) => (
            <Grid
              key={journey.id}
              size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}
            >
              <DraggableJourney
                journey={journey}
                disabled={publishedLock || dragInFlight}
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
        cursor:
          disabled === true ? 'default' : isDragging ? 'grabbing' : 'grab'
      }}
    >
      <JourneyCard journey={journey} />
    </Box>
  )
}
