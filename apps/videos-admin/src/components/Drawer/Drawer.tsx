import MuiDrawer from '@mui/material/Drawer'
import { ReactElement, ReactNode } from 'react'
import { DrawerTitle } from './DrawerTitle'
import Box from '@mui/material/Box'
import { DRAWER_PADDING_X } from './constants'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Drawer({
  open,
  onClose,
  title,
  children
}: DrawerProps): ReactElement {
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
      <DrawerTitle title={title} onClose={onClose} />
      <Box
        data-testid="DrawerContent"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          px: DRAWER_PADDING_X,
          mb: { md: 4 }
        }}
      >
        {children}
      </Box>
    </MuiDrawer>
  )
}
