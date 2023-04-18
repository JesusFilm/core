import { ReactElement } from 'react'
import Fab from '@mui/material/Fab'
import AddRounded from '@mui/icons-material/AddRounded'
import { usePage } from '../../../libs/PageWrapperProvider'

export function AddJourneyFab(): ReactElement {
  const {
    state: { mobileDrawerOpen },
    dispatch
  } = usePage()

  return (
    <Fab
      variant="extended"
      size="large"
      color="primary"
      onClick={() => {
        dispatch({
          type: 'SetMobileDrawerOpenAction',
          mobileDrawerOpen: !mobileDrawerOpen
        })
      }}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1,
        display: { xs: 'flex', sm: 'none' }
      }}
    >
      <AddRounded sx={{ mr: 3 }} />
      Add
    </Fab>
  )
}
