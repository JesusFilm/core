import type {
  DraggableAttributes,
  DraggableSyntheticListeners
} from '@dnd-kit/core'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import DragIcon from '@core/shared/ui/icons/Drag'

import { handleStopPropagation } from '../../utils/handleStopPropagation'
import { ADMIN_PRIMARY } from '../hoverOutline'

interface CanvasDragHandlePosition {
  top: number | string
  left?: number
  right?: number
  transform?: string
  zIndex?: number
}

interface CanvasDragHandleProps {
  /** The draggable's activator ref, listeners and attributes from `useDraggable`. */
  activatorRef: (element: HTMLElement | null) => void
  listeners: DraggableSyntheticListeners
  attributes: DraggableAttributes
  label: string
  testId: string
  dragging: boolean
  /** Shown without hover: the element it drags is selected. */
  visible: boolean
  /** Where the handle sits on the element it drags. */
  position: CanvasDragHandlePosition
  /** Keep a click on the handle from selecting what lies under it. */
  stopClick?: boolean
}

/**
 * The grab handle on a draggable canvas element (a section, a Column Slot, a
 * region card): hidden until the element is hovered, focused or selected.
 */
export function CanvasDragHandle({
  activatorRef,
  listeners,
  attributes,
  label,
  testId,
  dragging,
  visible,
  position,
  stopClick = false
}: CanvasDragHandleProps): ReactElement {
  return (
    <Box
      ref={activatorRef}
      {...listeners}
      {...attributes}
      aria-label={label}
      data-testid={testId}
      onClick={stopClick ? handleStopPropagation : undefined}
      sx={{
        position: 'absolute',
        display: 'flex',
        p: 0.5,
        borderRadius: 1,
        bgcolor: 'background.paper',
        color: ADMIN_PRIMARY.main,
        boxShadow: 1,
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        opacity: visible ? 1 : 0,
        '[data-hoverable]:hover > &, &:focus-visible': { opacity: 1 },
        ...position
      }}
    >
      <DragIcon fontSize="small" />
    </Box>
  )
}
