import { ReactElement } from 'react'
import Fab from '@mui/material/Fab'
import AddRounded from '@mui/icons-material/AddRounded'

export function AddJourneyFab(): ReactElement {
  return (
    <Fab
      variant="extended"
      size="large"
      color="primary"
      sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1 }}
    >
      <AddRounded sx={{ mr: 3 }} />
      Add
    </Fab>
  )
}
