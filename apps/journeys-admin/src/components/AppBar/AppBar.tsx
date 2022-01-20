import { ReactElement, ReactNode } from 'react'
import MuiAppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'

export interface AppBarProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  Menu?: ReactNode
}

export function AppBar({
  backHref,
  showDrawer,
  title,
  Menu
}: AppBarProps): ReactElement {
  return (
    <>
      <MuiAppBar
        position="fixed"
        color="default"
        sx={{
          ml: { sm: '72px' },
          mr: { sm: showDrawer === true ? '328px' : 0 },
          width: {
            sm:
              showDrawer === true
                ? 'calc(100% - 72px - 328px)'
                : 'calc(100% - 72px)'
          }
        }}
      >
        <Toolbar>
          {backHref != null && (
            <Link href={backHref} passHref>
              <IconButton
                edge="start"
                size="large"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <ChevronLeftRounded />
              </IconButton>
            </Link>
          )}
          <Typography
            variant="subtitle1"
            component="div"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {title}
          </Typography>
          {Menu != null && Menu}
        </Toolbar>
      </MuiAppBar>
      <Toolbar
        sx={{
          ml: { sm: '72px' },
          mr: { sm: showDrawer === true ? '328px' : 0 }
        }}
      />
      <Drawer
        sx={{
          width: '72px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '72px',
            boxSizing: 'border-box',
            backgroundColor: '#25262E'
          }
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ border: 'transparent' }} />
        <List>
          <ListItem button>
            <ListItemIcon>
              <ExploreRoundedIcon />
            </ListItemIcon>
          </ListItem>
        </List>
        <Divider sx={{ borderColor: '#383940' }} />
      </Drawer>
    </>
  )
}
