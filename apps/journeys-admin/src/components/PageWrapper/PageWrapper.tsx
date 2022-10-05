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
  sidePanel?: ReactNode
  bottomPanel?: ReactNode
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
  sidePanel,
  bottomPanel,
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
  console.log(
    'style',
    theme.components?.MuiToolbar?.styleOverrides?.dense as CSSObject
  )

  const AppHeader = (): ReactElement => (
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
  )

  const MainHeader = (): ReactElement => (
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
  )

  const SectionHeader = (): ReactElement => (
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

  const MobileHeaders = (): ReactElement => (
    <Box id="mobile-headers" sx={{ display: { sm: 'none' } }}>
      {showAppHeader && <AppHeader />}
      {/* <MainHeader /> */}
    </Box>
  )

  const StackLayout = (): ReactElement => (
    <Stack
      direction={{ sm: 'row' }}
      sx={{
        flexGrow: 1,
        pt: { xs: `${toolbarStyle.height}px`, sm: 0 },
        pb: { xs: '300px', sm: 0 }
      }}
    >
      <MobileHeaders />
      <Stack
        component="main"
        flexGrow={1}
        // sx={{
        //   backgroundColor: 'white'
        // }}
      >
        <MainHeader />
        <Grid
          container
          columns={{ xs: 4, sm: 12 }}
          alignContent="space-between"
          border="hidden"
          sx={{
            backgroundColor: 'white',
            height: '100%',
            overflow: 'none',
            overflowY: { sm: 'auto' },
            pt: { xs: `${toolbarStyle.height}px`, sm: 0 }
          }}
        >
          <MainBodyContainer />
          {bottomPanel != null && <BottomPanelContainer />}
        </Grid>
      </Stack>
      {sidePanel != null && (
        <Stack
          component="section"
          sx={{
            minWidth: { xs: '100%', sm: '327px' },
            backgroundColor: 'white',
            borderLeft: { sm: '1px solid' },
            borderColor: { sm: 'divider' }
          }}
        >
          <SectionHeader />
          <Grid
            container
            columns={4}
            border="hidden"
            sx={{ overflow: 'none', overflowY: { sm: 'auto' } }}
          >
            <SidePanelContainer />
            <SidePanelContainer />
            {sidePanel}
          </Grid>
        </Stack>
      )}
    </Stack>
  )

  const MainBodyContainer = (): ReactElement => (
    <Grid
      xs={4}
      sm={12}
      sx={{
        backgroundColor: 'white',
        px: 8,
        py: 9
      }}
    >
      {children}
    </Grid>
  )

  const BottomPanelContainer = (): ReactElement => (
    <Grid
      xs={4}
      sm={12}
      sx={{
        height: '300px',
        position: { xs: 'fixed', sm: 'unset' },
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      {bottomPanel}
      Bottom Panel Container - no padding since TabPanels usually go here
    </Grid>
  )

  const SidePanelContainer = (): ReactElement => (
    <Grid
      xs={4}
      sx={{
        backgroundColor: 'white',
        px: 6,
        py: 4,
        borderBottom: { sm: '1px solid' },
        borderColor: { sm: 'divider' }
      }}
    >
      Side Panel Container
    </Grid>
  )

  const BoxLayout = (): ReactElement => (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: '1fr', sm: '1fr 327px' }}
      gridTemplateRows={`${toolbarStyle.height}px 1fr`}
      sx={{
        flexGrow: 1,
        pt: { xs: `${toolbarStyle.height}px`, sm: 0 }
      }}
    >
      <MobileHeaders />
      <Grid sx={{ display: { xs: 'none', sm: 'grid' } }}>
        <MainHeader />
      </Grid>
      <Grid sx={{ display: { xs: 'none', sm: 'grid' } }}>
        <SectionHeader />
      </Grid>
      <Grid
        container
        columns={{ xs: 4, sm: 12 }}
        spacing={1}
        xs="auto"
        sx={{
          backgroundColor: 'red',
          height: '100%',
          '--Grid-borderWidth': '1px',
          borderRight: {
            xs: 'none',
            sm: 'var(--Grid-borderWidth)   solid'
          },
          // borderColor overwritten if not responsive
          borderColor: { sm: 'divider' },
          overflow: 'none',
          overflowY: { sm: 'auto' }
        }}
      >
        <Grid xs={1} sx={{ backgroundColor: 'olive', height: 100 }} />
        <Grid xs={1} sx={{ backgroundColor: 'green', height: 400 }} />
        Main page stuff
        {children}
      </Grid>
      <Grid
        container
        columns={4}
        xs="auto"
        sx={{
          backgroundColor: 'orange',
          height: '100%',
          overflow: 'none',
          overflowY: { sm: 'auto' }
        }}
      >
        <Grid xs={1} sx={{ backgroundColor: 'green', height: 50 }} />
        <Grid xs={1} sx={{ backgroundColor: 'green', height: 500 }} />
        <Grid xs={1} sx={{ backgroundColor: 'green', height: 50 }} />
        <Grid xs={1} sx={{ backgroundColor: 'green', height: 50 }} />
        side panel stuff
        {sidePanel}
      </Grid>
    </Box>
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

        <StackLayout />
        {/* <BoxLayout /> */}
      </Stack>
    </Box>
  )
}
