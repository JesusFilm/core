import { ReactElement } from 'react'
import Fab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import AddRounded from '@mui/icons-material/AddRounded'

interface AddFabProp {
  visible?: boolean
  onClick?: () => void
}

export function AddFab({ visible, onClick }: AddFabProp): ReactElement {
  return (
    <Zoom in={visible} unmountOnExit>
      <Fab variant="extended" size="large" color="primary" onClick={onClick}>
        <AddRounded sx={{ mr: 3 }} />
        Add
      </Fab>
    </Zoom>
  )
}
