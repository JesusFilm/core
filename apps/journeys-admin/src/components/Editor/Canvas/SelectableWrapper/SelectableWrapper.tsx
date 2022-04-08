import { ReactElement, MouseEvent } from 'react'
import {
  ActiveTab,
  ActiveFab,
  TreeBlock,
  WrapperProps,
  useEditor
} from '@core/journeys/ui'
import Box from '@mui/material/Box'

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

  const selectBlock = (block: TreeBlock): void => {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
    dispatch({
      type: 'SetActiveTabAction',
      activeTab: ActiveTab.Properties
    })
    dispatch({ type: 'SetSelectedBlockAction', block })
    dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
  }

  const editBlock = (): void => {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
  }

  // TODO: Test dispatch via E2E
  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    // Allow RadioQuestion select event to be overridden by RadioOption select/edit events (no e.stopPropogation)
    if (block.__typename === 'RadioQuestionBlock') {
      if (selectedBlock?.id === block.id) {
        editBlock()
      } else {
        selectBlock(block)
      }
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

  return isSelectable ? (
    <Box
      data-testid={`selected-${block.id}`}
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
        outline: selectedBlock?.id === block.id ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px',
        zIndex: selectedBlock?.id === block.id ? 1 : 0
      }}
      onClickCapture={handleSelectBlock}
      onClick={blockNonSelectionEvents}
    >
      {children}
    </Box>
  ) : (
    children
  )
}
