import { ReactElement, useContext } from 'react'
import Fab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
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

  return <Zoom
    in={activeTab !== ActiveTab.Blocks}
    unmountOnExit
  >
    <Fab
      variant="extended"
      size="large"
      color="primary"
      sx={{
        position: 'absolute',
        zIndex: 1,
        right: 20,
        bottom: 266
      }}
      onClick={handleClick}
    >
      <AddRounded sx={{ mr: 3 }} />
      Add
    </Fab>
  </Zoom>
}
