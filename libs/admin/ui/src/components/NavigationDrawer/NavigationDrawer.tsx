import Backdrop from '@mui/material/Backdrop'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import { ReactElement, ReactNode } from 'react'

import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

const DRAWER_WIDTH = '237px'

interface NavigationDrawerProps {
  open?: boolean
  onClose?: (value: boolean) => void
  children?: ReactNode
}

export function NavigationDrawer({
  open,
  onClose,
  children
}: NavigationDrawerProps): ReactElement {
  function handleClose(): void {
    onClose?.(open !== true)
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      variant="permanent"
      anchor="left"
      data-testid="NavigationDrawer"
      sx={{
        display: 'flex',
        width: { xs: 0, md: 72 },
        '& .MuiDrawer-paper': {
          border: 0,
          backgroundColor: 'secondary.dark',
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create('width'),
          width: open === true ? DRAWER_WIDTH : { xs: 0, md: 72 },
          zIndex: (theme) => theme.zIndex.drawer + 1
        }
      }}
    >
      <Backdrop open={open === true} onClick={handleClose} />
      <List
        component="nav"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 1.5,
          '& .MuiListItemButton-root, & .MuiListItem-root': {
            paddingLeft: 0,
            flexGrow: 0,
            '& .MuiListItemIcon-root': {
              minWidth: 'unset',
              width: '72px',
              justifyContent: 'center'
            },
            '& .MuiListItemText-primary': {
              fontSize: '15px',
              fontWeight: 'bold'
            },
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: 'secondary.light',
              transition: (theme) => theme.transitions.create('color')
            },
            '&.Mui-selected, &:hover, &.Mui-selected:hover': {
              backgroundColor: 'transparent',
              '& .MuiListItemIcon-root': {
                color: 'background.paper'
              },
              '& .MuiListItemText-primary': {
                color: 'background.paper'
              }
            }
          }
        }}
      >
        <ListItemButton
          onClick={handleClose}
          data-testid="NavigationListItemToggle"
          aria-label="Navigation Drawer Toggle"
        >
          <ListItemIcon
            sx={{
              '> .MuiSvgIcon-root': {
                backgroundColor: 'secondary.light',
                color: 'secondary.dark',
                borderRadius: 2,
                transition: (theme) =>
                  theme.transitions.create(['transform', 'background-color']),
                transform: {
                  md: open === true ? 'rotate(180deg)' : 'rotate(0deg)'
                },
                '&:hover': {
                  backgroundColor: 'background.paper'
                }
              }
            }}
          >
            <ChevronRightIcon />
          </ListItemIcon>
        </ListItemButton>
        {children}
      </List>
    </Drawer>
  )
}
