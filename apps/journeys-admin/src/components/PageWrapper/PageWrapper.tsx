import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'
import { CSSObject, useTheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Unstable_Grid2'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import Image from 'next/image'
import { AuthUser } from 'next-firebase-auth'
import { NextRouter } from 'next/router'
import MenuIcon from '@mui/icons-material/Menu'
import taskbarIcon from '../../../public/taskbar-icon.svg'
import { NavigationDrawer } from './NavigationDrawer'

export interface PageWrapperProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  menu?: ReactNode
  children?: ReactNode
  showAppHeader?: boolean
  sidePanelTitle?: string
  sidePanelChildren?: ReactNode
  bottomPanelChildren?: ReactNode
  authUser?: AuthUser
  router?: NextRouter
}

export function PageWrapper({
  backHref,
  showDrawer,
  showAppHeader = true,
  title,
  menu: customMenu,
  sidePanelTitle,
  sidePanelChildren,
  bottomPanelChildren,
  children,
  authUser,
  router
}: PageWrapperProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const theme = useTheme()
  const viewportHeight = use100vh()
  const toolbarStyle: { variant: 'dense' | 'regular'; height: number } = {
    variant: 'dense',
    height: (theme.components?.MuiToolbar?.styleOverrides?.dense as CSSObject)
      .maxHeight as number
  }

  const AppHeader = (): ReactElement => (
    <Box id="app-header" sx={{ display: { sm: 'none' } }}>
      <AppBar
        role="banner"
        position="fixed"
        sx={{
          backgroundColor: 'secondary.dark',
          display: { xs: 'flex', sm: 'none' }
        }}
      >
        <Toolbar variant={toolbarStyle.variant}>
          <Grid container columns={4} sx={{ flexGrow: 1 }}>
            <Grid xs={1}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={() => setOpen(!open)}
              >
                <MenuIcon sx={{ color: 'background.paper' }} />
              </IconButton>
            </Grid>
            <Grid
              xs={2}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                src={taskbarIcon}
                width={32}
                height={32}
                layout="fixed"
                alt="Next Steps"
              />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  )

  const MainHeader = (): ReactElement => (
    <>
      <AppBar
        color="default"
        sx={{
          position: { xs: 'fixed', sm: 'sticky' },
          top: { xs: toolbarStyle.height, sm: 0 }
        }}
      >
        <Toolbar variant="dense">
          <Grid container sx={{ flexGrow: 1 }} alignItems="center">
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
          </Grid>
        </Toolbar>
      </AppBar>
      {/* Reserves space beneath MainHeader on mobile - allows us to export MainPanel */}
      <Toolbar variant="dense" sx={{ display: { sm: 'none' } }} />
    </>
  )

  const SideHeader = (): ReactElement => (
    <AppBar
      position="sticky"
      color="default"
      sx={{
        display: { xs: 'none', sm: 'flex' }
      }}
    >
      <Toolbar variant="dense">
        <Typography variant="subtitle1" component="div" noWrap>
          {sidePanelTitle}
        </Typography>
      </Toolbar>
    </AppBar>
  )

  const MainPanel = (): ReactElement => (
    <Grid
      container
      columns={{ xs: 4, sm: 12 }}
      alignContent="space-between"
      border="hidden"
      sx={{
        height: '100%',
        overflow: 'none',
        overflowY: { sm: 'auto' }
      }}
    >
      {/* children must be MainBodyContainer/s */}
      {children}
      {/* Must be BottomPanelContainer/s */}
      {bottomPanelChildren}
    </Grid>
  )

  const SidePanel = (): ReactElement => (
    <Grid
      container
      columns={4}
      border="hidden"
      sx={{ overflow: 'none', overflowY: { sm: 'auto' } }}
    >
      {/* Must be SidePanelContainer/s */}
      {sidePanelChildren}
    </Grid>
  )

  return (
    <Box
      sx={{
        height: viewportHeight ?? '100vh',
        overflow: 'hidden',
        [theme.breakpoints.only('xs')]: { overflowY: 'auto' }
      }}
    >
      <Stack direction={{ sm: 'row' }} sx={{ height: 'inherit' }}>
        <NavigationDrawer
          open={open}
          onClose={setOpen}
          authUser={authUser}
          title={title}
          router={router}
        />
        <Stack
          direction={{ sm: 'row' }}
          sx={{
            backgroundColor: 'background.default',
            flexGrow: 1,
            pt: { xs: `${toolbarStyle.height}px`, sm: 0 },
            pb: { xs: bottomPanelChildren != null ? '300px' : 0, sm: 0 }
          }}
        >
          {showAppHeader && <AppHeader />}
          <Stack component="main" flexGrow={1}>
            <MainHeader />
            <MainPanel />
          </Stack>
          {sidePanelChildren != null && (
            <Stack
              component="section"
              sx={{
                minWidth: { xs: '100%', sm: '327px' },
                backgroundColor: 'background.paper',
                borderLeft: { sm: '1px solid' },
                borderColor: { sm: 'divider' }
              }}
            >
              <SideHeader />
              <SidePanel />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
