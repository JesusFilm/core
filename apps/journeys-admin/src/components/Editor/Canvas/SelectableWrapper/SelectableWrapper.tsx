import { ReactElement, MouseEvent } from 'react'
import {
  useEditor,
  ActiveTab,
  ActiveFab,
  WrapperProps
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

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

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
      if (selectedBlock?.id === block.id) {
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
      } else {
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
      sx={{
        '&:last-child': {
          '& > *': {
            marginBottom: '0px'
          }
        },
        borderRadius: '4px',
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
