import { DragOverEvent, useDndMonitor } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Popper from '@mui/material/Popper'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import DragIcon from '@core/shared/ui/icons/Drag'

export function DragItemWrapper({
  block,
  children
}: WrapperProps): ReactElement {
  const [isHovering, setIsHovering] = useState(false)
  const selectableRef = useRef<HTMLDivElement>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [isDuringDrag, setIsDuringDrag] = useState<boolean>(false)
  const [isAbove, setIsAbove] = useState<boolean>(false)
  const {
    state: { selectedBlock, selectedStep }
  } = useEditor()
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const [blockIds, setBlockIds] = useState<string[]>([])

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  useEffect(() => {
    setBlockIds(
      (
        selectedStep?.children[0].children.filter(
          (block) =>
            block != null &&
            block.__typename !== 'RadioOptionBlock' &&
            block.__typename !== 'StepBlock' &&
            block.__typename !== 'CardBlock' &&
            block.__typename !== 'IconBlock' &&
            block.parentOrder !== null
        ) ?? []
      ).map((block) => block.id)
    )
  }, [selectedStep])

  useDndMonitor({
    onDragMove(e: DragOverEvent): void {
      if (!isDuringDrag) {
        setIsDuringDrag(true)
      }
      const { active, over } = e
      if (over != null && active.id !== over.id && blockIds != null) {
        setDragId(over.id as string)
        const overIndex = blockIds.indexOf(over.id as string)
        const activeIndex = blockIds.indexOf(active.id as string)
        setIsAbove(activeIndex < overIndex)
      } else {
        setDragId(null)
      }
    },
    onDragEnd() {
      endDrag()
    },
    onDragCancel() {
      endDrag()
    }
  })

  const { listeners, setNodeRef, isDragging, setActivatorNodeRef } =
    useSortable({
      id: block.id
    })

  const modifiers = [
    {
      name: 'preventOverflow',
      enabled: false
    },
    {
      name: 'flip',
      enabled: false
    }
  ]

  function endDrag() {
    setIsDuringDrag(false)
    setDragId(null)
  }

  return (
    <Box ref={selectableRef}>
      <Box
        data-testid={`DragItemWrapper-${block.id}`}
        ref={setNodeRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        sx={{
          opacity: isDragging ? 0.4 : 1
        }}
      >
        {children}
      </Box>
      <Popper
        open={block.id === dragId}
        anchorEl={selectableRef.current}
        placement={isAbove ? 'bottom' : 'top'}
        modifiers={modifiers}
      >
        <Divider
          orientation="horizontal"
          sx={{
            width: '240px',
            height: '2px',
            mt: '6px',
            mb: '6px',
            backgroundColor: '#C52D3A',
            borderRadius: '1px'
          }}
        />
      </Popper>
      <Popper
        open={smUp || (!smUp && block.id === selectedBlock?.id)}
        anchorEl={selectableRef.current}
        placement={rtl ? 'right' : 'left'}
        {...listeners}
        ref={setActivatorNodeRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        modifiers={modifiers}
      >
        <DragIcon
          fontSize="large"
          style={{
            position: 'absolute',
            left: rtl ? undefined : '-29px',
            right: rtl ? '-29px' : undefined,
            top: '-18px',
            opacity: isHovering && !isDuringDrag ? 1 : 0,
            cursor: 'grab',
            alignSelf: 'center'
          }}
        />
      </Popper>
    </Box>
  )
}
