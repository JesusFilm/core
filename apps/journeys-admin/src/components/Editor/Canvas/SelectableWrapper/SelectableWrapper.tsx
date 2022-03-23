import { ReactElement, MouseEvent } from 'react'
import {
  ActiveTab,
  ActiveFab,
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

  // TODO: Test via E2E
  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    if (block.__typename === 'RadioOptionBlock') {
      const parentSelected = selectedBlock?.id === block.parentBlockId
      const siblingSelected =
        selectedBlock?.parentBlockId === block.parentBlockId

      if (selectedBlock?.id === block.id) {
        e.stopPropagation()
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
      } else if (parentSelected || siblingSelected) {
        e.stopPropagation()
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({ type: 'SetSelectedBlockAction', block })
        dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
      }
    } else {
      if (selectedBlock?.id === block.id && isInlineEditable) {
        e.stopPropagation()
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
      } else {
        e.stopPropagation()
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({ type: 'SetSelectedBlockAction', block })
        dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
      }
    }
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
        '&:last-child': {
          '& > *': {
            marginBottom: '0px'
          }
        },
        borderRadius: block.__typename === 'RadioOptionBlock' ? '8px' : '4px',
        outline: selectedBlock?.id === block.id ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px',
        zIndex: selectedBlock?.id === block.id ? 1 : 0
      }}
      onClick={handleSelectBlock}
    >
      {children}
    </Box>
  ) : (
    children
  )
}
