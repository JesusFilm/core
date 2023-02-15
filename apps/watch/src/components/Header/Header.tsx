import { ReactElement, useState, forwardRef, MouseEventHandler } from 'react'
import Fade from '@mui/material/Fade'
import Slide from '@mui/material/Slide'
import Container from '@mui/material/Container'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Stack from '@mui/material/Stack'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import NextLink from 'next/link'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import logo from './assets/logo.svg'
import { HeaderMenuPanel } from './HeaderMenuPanel'

interface LocalAppBarProps extends AppBarProps {
  onMenuClick: MouseEventHandler<HTMLButtonElement>
}

const LocalAppBar = forwardRef<HTMLDivElement, LocalAppBarProps>(
  ({ onMenuClick, ...props }, ref) => {
    return (
      <AppBar
        position="absolute"
        {...props}
        sx={{
          p: 4,
          ...props.sx
        }}
        ref={ref}
      >
        <Container maxWidth="xxl" disableGutters>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <NextLink href="/" passHref>
              <a>
                <Image
                  src={logo}
                  width="160"
                  height="40"
                  alt="Watch Logo"
                  style={{ cursor: 'pointer' }}
                />
              </a>
            </NextLink>
            <Stack spacing={0.5} direction="row">
              <IconButton
                color="inherit"
                aria-label="open header menu"
                edge="start"
                onClick={onMenuClick}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
    )
  }
)
LocalAppBar.displayName = 'LocalAppBar'

interface HeaderProps {
  hideAbsoluteAppBar?: boolean
}

export function Header({ hideAbsoluteAppBar }: HeaderProps): ReactElement {
  const trigger = useScrollTrigger()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Fade
        in={hideAbsoluteAppBar !== true}
        style={{
          transitionDelay: hideAbsoluteAppBar !== true ? undefined : '2s',
          transitionDuration: '225ms'
        }}
        timeout={{ exit: 2225 }}
      >
        <LocalAppBar
          sx={{
            background: 'transparent',
            boxShadow: 'none'
          }}
          onMenuClick={() => setDrawerOpen(true)}
        />
      </Fade>
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
        nested
      >
        <Slide in={trigger}>
          <LocalAppBar
            sx={{ backgroundColor: 'background.default' }}
            position="fixed"
            onMenuClick={() => setDrawerOpen(true)}
          />
        </Slide>
      </ThemeProvider>
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.light}
        nested
      >
        <SwipeableDrawer
          anchor="top"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOpen={() => setDrawerOpen(true)}
        >
          <HeaderMenuPanel onClose={() => setDrawerOpen(false)} />
        </SwipeableDrawer>
      </ThemeProvider>
    </>
  )
}
