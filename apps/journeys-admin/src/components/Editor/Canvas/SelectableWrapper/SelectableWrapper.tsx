import Box from '@mui/material/Box'
import { MouseEvent, ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import {
  ActiveFab,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'

export function SelectableWrapper({
  block,
  children
}: WrapperProps): ReactElement {
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

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
    dispatch({
      type: 'SetActiveTabAction',
      activeTab: ActiveTab.Properties
    })
    dispatch({ type: 'SetSelectedBlockAction', block })
    dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
  }

  const selectBlock = (block: TreeBlock): void => {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
    updateEditor(block)
  }

  const editBlock = (): void => {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
  }

  // TODO: Test dispatch via E2E
  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    // Allow RadioQuestion select event to be overridden by RadioOption select/edit events (no e.stopPropogation)
    if (block.__typename === 'RadioQuestionBlock') {
      // Directly edit RadioQuestionBlock
      updateEditor(block)
      editBlock()
    } else if (block.__typename === 'RadioOptionBlock') {
      e.stopPropagation()
      const parentSelected = selectedBlock?.id === block.parentBlockId
      const siblingSelected =
        selectedBlock?.parentBlockId === block.parentBlockId

      if (selectedBlock?.id === block.id) {
        // Must override RadioQuestionBlock selected during event capture
        dispatch({ type: 'SetSelectedBlockAction', block })
        editBlock()
      } else if (parentSelected || siblingSelected) {
        selectBlock(block)
      }
    } else {
      e.stopPropagation()
      if (selectedBlock?.id === block.id && isInlineEditable) {
        editBlock()
      } else {
        selectBlock(block)
      }
    }
  }

  // Container Blocks (RadioQuestion, Grid) don't stop propogation on ClickCapture, stop onClick so child events still occur.
  const blockNonSelectionEvents = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()
  }

  const videoOutlineStyles =
    selectedBlock?.__typename === 'VideoBlock'
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

  return isSelectable ? (
    <Box
      data-testid={`SelectableWrapper-${block.id}`}
      className={
        block.__typename === 'RadioOptionBlock'
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
        borderRadius: block.__typename === 'RadioOptionBlock' ? '8px' : '4px',
        outline: selectedBlock?.id === block.id ? '2px solid #C52D3A' : 'none',
        outlineOffset: '5px',
        zIndex: selectedBlock?.id === block.id ? 1 : 0,
        ...videoOutlineStyles
      }}
      onClickCapture={handleSelectBlock}
      onClick={blockNonSelectionEvents}
      onMouseDown={blockNonSelectionEvents}
    >
      {children}
    </Box>
  ) : (
    children
  )
}
