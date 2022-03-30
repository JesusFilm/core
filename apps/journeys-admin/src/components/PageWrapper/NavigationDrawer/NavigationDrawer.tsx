import { ReactElement } from 'react'
import Drawer from '@mui/material/Drawer'
import { AuthUser } from 'next-firebase-auth'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme, Theme } from '@mui/material/styles'
import { DrawerContent } from './DrawerContent'

const drawerWidth = '237px'

interface NavigationDrawerProps {
  open: boolean
  onClose: (value: boolean) => void
  AuthUser?: AuthUser
}

export function NavigationDrawer({
  open,
  onClose,
  AuthUser
}: NavigationDrawerProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const theme = useTheme()

  return (
    <Drawer
      open={open}
      sx={{
        width: drawerWidth,
        display: { xs: smUp ? 'none' : 'flex', sm: 'flex' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#25262E',
          border: 0,
          ...(open && {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            }),
            overflowX: 'hidden'
          }),
          ...(!open && {
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            }),
            overflowX: 'hidden',
            width: `calc(${theme.spacing(18)})`,
            [theme.breakpoints.up('sm')]: {
              width: `calc(${theme.spacing(18)})`
            }
          })
        }
      }}
      elevation={0}
      hideBackdrop
      variant={smUp ? 'permanent' : 'temporary'}
      anchor="left"
    >
      <DrawerContent open={open} onClose={onClose} AuthUser={AuthUser} />
    </Drawer>
  )
}
