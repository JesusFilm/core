import MuiFab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import { ReactElement } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

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
    <Zoom in={visible} unmountOnExit data-testid="Fab">
      {activeFab === ActiveFab.Add ? (
        <MuiFab
          variant="extended"
          size="large"
          color="primary"
          onClick={onAddClick}
          disabled={disabled}
        >
          <Plus2Icon sx={{ mr: 3 }} />
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
          <Edit2Icon sx={{ mr: 3 }} />
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
          <CheckContainedIcon sx={{ mr: 3 }} />
          Done
        </MuiFab>
      )}
    </Zoom>
  )
}
