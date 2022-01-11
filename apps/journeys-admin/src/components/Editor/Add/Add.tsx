import { ReactElement, useContext } from 'react'
import { Button } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import { ActiveTab, EditorContext } from '../Context'

export function Add(): ReactElement {
  const {
    state: { activeTab },
    dispatch
  } = useContext(EditorContext)

  const handleClick = (): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Blocks })
  }

  return activeTab === ActiveTab.Blocks ? (
    <></>
  ) : (
    <Button
      variant="contained"
      size="small"
      startIcon={<AddRounded />}
      onClick={handleClick}
      sx={{
        position: 'absolute',
        zIndex: 'modal',
        width: 105,
        height: 48,
        boxShadow: 5,
        right: 20,
        bottom: 260
      }}
    >
      ADD
    </Button>
  )
}
