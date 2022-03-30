import { ReactElement, ReactNode, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import Image from 'next/image'
import { AuthUser } from 'next-firebase-auth'
import useMediaQuery from '@mui/material/useMediaQuery'
import MenuIcon from '@mui/icons-material/Menu'
import { Theme } from '@mui/material/styles'
import taskbarIcon from '../../../public/taskbar-icon.svg'
import { NavigationDrawer } from './NavigationDrawer'

export interface PageWrapperProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  Menu?: ReactNode
  children?: ReactNode
  AuthUser?: AuthUser
}

export function PageWrapper({
  backHref,
  showDrawer,
  title,
  Menu: CustomMenu,
  children,
  AuthUser
}: PageWrapperProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      <AppBar
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
        {!smUp ? (
          <Toolbar
            sx={{
              position: 'relative',
              backgroundColor: 'secondary.dark'
            }}
          >
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(!open)}
            >
              <MenuIcon sx={{ color: 'background.paper' }} />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                right: '45%'
              }}
            >
              <Image
                src={taskbarIcon}
                width={32}
                height={32}
                layout="fixed"
                alt="Next Steps"
              />
            </Box>
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
          {CustomMenu != null && CustomMenu}
        </Toolbar>
      </AppBar>
      <Toolbar
        sx={{
          ml: { sm: '72px' },
          mr: { sm: showDrawer === true ? '328px' : 0 }
        }}
      />
      <NavigationDrawer open={open} onClose={setOpen} AuthUser={AuthUser} />
      <Box sx={{ ml: { sm: '72px' }, pt: smUp ? 0 : '48px' }}>{children}</Box>
    </>
  )
}
