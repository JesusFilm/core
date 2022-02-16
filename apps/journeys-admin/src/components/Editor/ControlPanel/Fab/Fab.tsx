import { ReactElement } from 'react'
import MuiFab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import AddRounded from '@mui/icons-material/AddRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import { useEditor, ActiveFab } from '@core/journeys/ui'

interface FabProp {
  visible?: boolean
  onAddClick: () => void
}

export function Fab({ visible, onAddClick }: FabProp): ReactElement {
  const {
    state: { activeFab },
    dispatch
  } = useEditor()

  const handleEditFab = (): void => {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
  }

  const handleSaveFab = (): void => {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
  }

  return (
    <Zoom in={visible} unmountOnExit>
      {activeFab === ActiveFab.Add ? (
        <MuiFab
          variant="extended"
          size="large"
          color="primary"
          onClick={onAddClick}
        >
          <AddRounded sx={{ mr: 3 }} />
          Add
        </MuiFab>
      ) : activeFab === ActiveFab.Edit ? (
        <MuiFab
          variant="extended"
          size="large"
          color="primary"
          onClick={handleEditFab}
        >
          <EditRounded sx={{ mr: 3 }} />
          Edit
        </MuiFab>
      ) : (
        <MuiFab
          variant="extended"
          size="large"
          color="primary"
          onClick={handleSaveFab}
        >
          <CheckCircleRounded sx={{ mr: 3 }} />
          Done
        </MuiFab>
      )}
    </Zoom>
  )
}
