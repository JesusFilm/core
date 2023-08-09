import AddRounded from '@mui/icons-material/AddRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import MuiFab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import { ReactElement } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'

interface FabProp {
  visible?: boolean
  onAddClick: () => void
  disabled?: boolean
}

export function Fab({ visible, onAddClick, disabled }: FabProp): ReactElement {
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
          disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
        >
          <CheckCircleRounded sx={{ mr: 3 }} />
          Done
        </MuiFab>
      )}
    </Zoom>
  )
}
