import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Image from 'next/image'
import Link from 'next/link'
import { user as AuthUser } from 'next-firebase-auth'
import { ReactElement, ReactNode, useState } from 'react'

import taskbarIcon from '../../../public/taskbar-icon.svg'

import { NavigationDrawer } from './NavigationDrawer'

export interface PageWrapperProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  menu?: ReactNode
  children?: ReactNode
  authUser?: AuthUser
}

export function PageWrapper({
  backHref,
  showDrawer,
  title,
  menu: customMenu,
  children,
  authUser
}: PageWrapperProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const showAppBarMobile =
    title === 'Active Journeys' ||
    title === 'Archived Journeys' ||
    title === 'Trashed Journeys' ||
    title === 'Journey Details' ||
    title === 'Journey Report' ||
    title === 'Reports' ||
    title === 'Journey Templates' ||
    title === 'Journey Template' ||
    title === 'Template Details'

  return (
    <>
      <AppBar
        position="sticky"
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
        {showAppBarMobile ? (
          <Toolbar
            sx={{
              backgroundColor: 'secondary.dark',
              justifyContent: 'center',
              display: smUp ? 'none' : 'flex'
            }}
          >
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(!open)}
              sx={{
                position: 'absolute',
                left: '25px'
              }}
            >
              <MenuIcon sx={{ color: 'background.paper' }} />
            </IconButton>
            <Image src={taskbarIcon} width={32} height={32} alt="Next Steps" />
          </Toolbar>
        ) : (
          <></>
        )}
        <Toolbar>
          {backHref != null && (
            <Link href={backHref} passHref>
              <IconButton
                edge="start"
                size="small"
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
          {customMenu != null && customMenu}
        </Toolbar>
      </AppBar>
      <NavigationDrawer open={open} onClose={setOpen} authUser={authUser} />
      <Box
        sx={{
          ml: { sm: '72px' }
        }}
      >
        {children}
      </Box>
    </>
  )
}
