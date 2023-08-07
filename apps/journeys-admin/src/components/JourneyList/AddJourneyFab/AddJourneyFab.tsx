import AddRounded from '@mui/icons-material/AddRounded'
import Fab from '@mui/material/Fab'
import { ReactElement } from 'react'

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
        display: { xs: 'flex', md: 'none' }
      }}
    >
      <AddRounded sx={{ mr: 3 }} />
      Add
    </Fab>
  )
}
