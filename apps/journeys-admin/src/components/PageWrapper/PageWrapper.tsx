import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Image from 'next/image'
import NextLink from 'next/link'
import type { User } from 'next-firebase-auth'
import { ReactElement, ReactNode, useState } from 'react'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import Menu1Icon from '@core/shared/ui/icons/Menu1'

import taskbarIcon from '../../../public/taskbar-icon.svg'
import { NavigationDrawer } from '../NewPageWrapper/NavigationDrawer'

export interface PageWrapperProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  menu?: ReactNode
  children?: ReactNode
  user?: User
}

export function PageWrapper({
  backHref,
  showDrawer,
  title,
  menu: customMenu,
  children,
  user
}: PageWrapperProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const showAppBarMobile =
    title === 'Active Journeys' ||
    title === 'Archived Journeys' ||
    title === 'Trashed Journeys' ||
    title === 'Journey Details' ||
    title === 'Journey Report' ||
    title === 'Analytics' ||
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
        data-testid="JourneysAdminPageWrapper"
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
              <Menu1Icon sx={{ color: 'background.paper' }} />
            </IconButton>
            <Image src={taskbarIcon} width={32} height={32} alt="Next Steps" />
          </Toolbar>
        ) : (
          <></>
        )}
        <Toolbar>
          {backHref != null && (
            <NextLink href={backHref} passHref legacyBehavior>
              <IconButton
                edge="start"
                size="small"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </NextLink>
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
      <NavigationDrawer open={open} onClose={setOpen} user={user} />
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
