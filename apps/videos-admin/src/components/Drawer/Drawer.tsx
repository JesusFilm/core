import MuiDrawer from '@mui/material/Drawer'
import { ReactElement } from 'react'
import { DrawerTitle } from './DrawerTitle'
import Box from '@mui/material/Box'
import { DRAWER_PADDING_X } from './constants'
import { useDrawerStore } from './store'

export function Drawer(): ReactElement {
  const { open, title, closeDrawer, content } = useDrawerStore()

  return (
    <MuiDrawer
      open={open}
      anchor="right"
      elevation={0}
      hideBackdrop
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          border: '1px solid',
          borderColor: 'divider',
          width: { xs: 'auto', md: 500 }
          // position: contained === true ? 'absolute' : 'fixed'
        }
      }}
    >
      <DrawerTitle title={title} onClose={closeDrawer} />
      <Box
        data-testid="DrawerContent"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          px: DRAWER_PADDING_X,
          mb: { md: 4 },
          mt: 4
        }}
      >
        {content}
      </Box>
    </MuiDrawer>
  )
}
