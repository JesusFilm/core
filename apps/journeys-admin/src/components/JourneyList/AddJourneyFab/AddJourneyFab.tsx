import { ReactElement } from 'react'
import Fab from '@mui/material/Fab'
import AddRounded from '@mui/icons-material/AddRounded'

interface AddJourneyFabProps {
  onClick?: () => void
}

export function AddJourneyFab({ onClick }: AddJourneyFabProps): ReactElement {
  return (
    <Fab
      variant="extended"
      size="large"
      color="primary"
      onClick={onClick}
      sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1 }}
    >
      <AddRounded sx={{ mr: 3 }} />
      Add
    </Fab>
  )
}
