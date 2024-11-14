import { DragOverEvent, useDndMonitor } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import { MouseEvent, ReactElement, useEffect, useRef, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import DragIcon from '@core/shared/ui/icons/Drag'

import { QuickControls } from '../QuickControls'

export function SelectableWrapper({
  block,
  children
}: WrapperProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const selectableRef = useRef<HTMLDivElement>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [isAbove, setIsAbove] = useState(false)
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  const { listeners, setNodeRef, transition, isDragging, setActivatorNodeRef } =
    useSortable({
      id: block.id
    })

  const blockIds = (
    selectedStep?.children[0].children.filter(
      (block) =>
        block != null &&
        block.__typename !== 'StepBlock' &&
        block.__typename !== 'CardBlock' &&
        block.__typename !== 'IconBlock' &&
        block.parentOrder !== null
    ) ?? []
  ).map((block) => block.id)

  useDndMonitor({
    onDragOver(e: DragOverEvent): void {
      const { active, over } = e
      if (over != null && active.id !== over.id) {
        setDragId(over.id as string)
        const overIndex = blockIds.indexOf(over.id as string)
        const activeIndex = blockIds.indexOf(active.id as string)
        setIsAbove(activeIndex < overIndex)
      } else {
        setDragId(null)
      }
    },
    onDragEnd() {
      setDragId(null)
    }
  })

  const isSelectable =
    selectedBlock != null &&
    block.__typename !== 'StepBlock' &&
    block.__typename !== 'CardBlock' &&
    block.__typename !== 'IconBlock'

  const isInlineEditable =
    isSelectable &&
    block.__typename !== 'VideoBlock' &&
    block.__typename !== 'ImageBlock' &&
    block.__typename !== 'GridContainerBlock' &&
    block.__typename !== 'GridItemBlock'

  const updateEditor = (block: TreeBlock): void => {
    dispatch({ type: 'SetSelectedBlockAction', selectedBlock: block })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: undefined
    })
  }

  // TODO: Test dispatch via E2E
  // please check RadioOptionBlock events are being propogated properly i.e - can be re-ordered
  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    // Allow RadioQuestion select event to be overridden by RadioOption select/edit events (no e.stopPropogation)
    if (block.__typename === 'RadioQuestionBlock') {
      // Directly edit RadioQuestionBlock
      updateEditor(block)
    } else if (block.__typename === 'RadioOptionBlock') {
      // this stopPropagation prevents links from being opened in the editor when clicked radioOptions are selected
      e.stopPropagation()
      const parentSelected = selectedBlock?.id === block.parentBlockId
      const siblingSelected =
        selectedBlock?.parentBlockId === block.parentBlockId

      if (selectedBlock?.id === block.id) {
        // Must override RadioQuestionBlock selected during event capture
        dispatch({ type: 'SetSelectedBlockAction', selectedBlock: block })
      } else if (parentSelected || siblingSelected) {
        updateEditor(block)
      }
    } else {
      e.stopPropagation()
      // eslint-disable-next-line no-empty
      if (selectedBlock?.id === block.id && isInlineEditable) {
      } else {
        updateEditor(block)
      }
    }
  }

  // Container Blocks (RadioQuestion, Grid) don't stop propogation on ClickCapture, stop onClick so child events still occur.
  const blockNonSelectionEvents = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()
  }

  const videoOutlineStyles =
    block?.__typename === 'VideoBlock'
      ? {
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          outlineOffset: '-3px',
          borderRadius: '20px',
          my: '0px !important',
          '&:first-child': {
            '& > *': { zIndex: -1 }
          }
        }
      : {}

  let borderRadius = '4px'
  switch (block.__typename) {
    case 'RadioOptionBlock':
      borderRadius = '8px'
      break
    case 'ImageBlock':
      borderRadius = '16px'
      break
    case 'SignUpBlock':
      borderRadius = '4px 4px 16px 16px'
      break
    case 'ButtonBlock':
      if (block.buttonVariant === 'contained') {
        if (block.size === 'large') borderRadius = '16px'
        if (block.size === 'medium') borderRadius = '12px'
        if (block.size === 'small') borderRadius = '8px'
      }
  }

  useEffect(() => {
    setOpen(selectedBlock?.id === block.id)
  }, [selectedBlock, block])

  const isVideoBlock = block?.__typename === 'VideoBlock'
  const isRadioOptionBlock = block?.__typename === 'RadioOptionBlock'

  return isSelectable ? (
    <Box
      ref={!isRadioOptionBlock ? setNodeRef : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{
        boxShadow:
          block.id === dragId
            ? isAbove
              ? '0px 3px 0 0 #C52D3A'
              : '0px -3px 0 0 #C52D3A'
            : 'none'
      }}
    >
      <Box
        ref={selectableRef}
        style={{
          opacity: isDragging ? 0.4 : 1,
          transition
        }}
        data-testid={`SelectableWrapper-${block.id}`}
        className={
          isRadioOptionBlock
            ? 'MuiButtonGroup-root MuiButtonGroup-grouped MuiButtonGroup-groupedVertical'
            : ''
        }
        sx={{
          '&:first-child': {
            '& > *': { mt: '0px' }
          },
          '&:last-child': {
            '& > *': { mb: '0px' }
          },
          borderRadius,
          outline: '2px solid ',
          outlineColor:
            selectedBlock?.id === block.id ? '#C52D3A' : 'transparent',
          transition: (theme) => theme.transitions.create('outline-color'),
          outlineOffset: '5px',
          zIndex: selectedBlock?.id === block.id ? 1 : 0,
          ...videoOutlineStyles
        }}
        // if changing the event handlers or their functions, please check RadioOptionBlock events are being propogated properly i.e - can be re-ordered
        onClickCapture={handleSelectBlock}
        onClick={blockNonSelectionEvents}
        onMouseDown={blockNonSelectionEvents}
      >
        <Box>{children}</Box>
      </Box>
      <QuickControls
        open={open}
        anchorEl={selectableRef.current}
        isVideoBlock={isVideoBlock}
      />
      {!isVideoBlock && (
        <Popper
          open={
            selectedBlock.__typename === 'StepBlock' ||
            selectedBlock.__typename === 'CardBlock'
          }
          anchorEl={selectableRef.current}
          placement={isRadioOptionBlock ? 'right' : 'left'}
          {...listeners}
          ref={setActivatorNodeRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <DragIcon
            fontSize="large"
            style={{
              position: 'absolute',
              left: isRadioOptionBlock ? undefined : '-30px',
              right: isRadioOptionBlock ? '0px' : undefined,
              top: '-18px',
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: 'rotate(90deg)',
              opacity: dragId != null || !isHovering || isDragging ? 0 : 1,
              color: isRadioOptionBlock ? '#000000' : 'secondary.dark'
            }}
          />
        </Popper>
      )}
    </Box>
  ) : (
    children
  )
}
