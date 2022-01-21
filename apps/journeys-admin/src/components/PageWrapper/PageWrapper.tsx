import { ReactElement, ReactNode } from 'react'
import MuiAppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Box from '@mui/material/Box'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import Image from 'next/image'

export interface PageWrapperProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  Menu?: ReactNode
  children?: ReactNode
}

export function PageWrapper({
  backHref,
  showDrawer,
  title,
  Menu,
  children
}: PageWrapperProps): ReactElement {
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
          display: { xs: 'none', sm: 'flex' },
          '& .MuiDrawer-paper': {
            width: '72px',
            boxSizing: 'border-box',
            backgroundColor: '#25262E',
            border: 0
          }
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ border: 'transparent', justifyContent: 'center', p: 0 }}>
          <Image
            src="/taskbar-icon.png"
            width={32}
            height={32}
            layout="fixed"
            alt="Next Steps"
          />
        </Toolbar>
        <List>
          <Link href="/" passHref>
            <ListItem
              sx={{ justifyContent: 'center', color: '#6D6F81' }}
              button
            >
              <ExploreRoundedIcon />
            </ListItem>
          </Link>
        </List>
        <Divider sx={{ borderColor: '#383940' }} />
      </Drawer>
      <Box sx={{ ml: { sm: '72px' } }}>{children}</Box>
    </>
  )
}
