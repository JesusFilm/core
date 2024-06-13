import MenuIcon from '@mui/icons-material/Menu'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import Stack from '@mui/material/Stack'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Toolbar from '@mui/material/Toolbar'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import Image from 'next/image'
import NextLink from 'next/link'
import { MouseEventHandler, ReactElement, forwardRef, useState } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import favicon from './assets/favicon.png'
import { HeaderMenuPanel } from './HeaderMenuPanel'
import { HeaderTabButtons } from './HeaderTabButtons'

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
          <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <NextLink href="/watch">
                <Box
                  sx={{
                    width: { xs: '64px', md: '76px', xl: '88px' },
                    marginLeft: { xs: '-8px', md: '-12px', xl: '0px' }
                  }}
                >
                  <Image
                    src={favicon}
                    alt="Watch Logo"
                    style={{
                      cursor: 'pointer',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </Box>
              </NextLink>
              <Stack
                data-testid="ButtonsAndMenuStack"
                spacing={0.5}
                direction="row"
              >
                <Box
                  data-testid="DesktopButtons"
                  sx={{
                    display: { xs: 'none', md: 'flex', lg: 'none', xl: 'flex' }
                  }}
                >
                  <HeaderTabButtons />
                </Box>
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
            <Box
              data-testid="TabletButtons"
              sx={{ display: { xs: 'none', lg: 'flex', xl: 'none' } }}
            >
              <HeaderTabButtons />
            </Box>
          </Stack>
        </Container>
        {/* drop down button on mobile */}
        <Box
          justifyContent="center"
          data-testid="ButtonBox"
          sx={{
            position: 'absolute',
            zIndex: 1,
            bottom: -24,
            left: 0,
            right: 0,
            height: '48px',
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <HeaderTabButtons />
        </Box>
      </AppBar>
    )
  }
)
LocalAppBar.displayName = 'LocalAppBar'

interface HeaderProps {
  hideAbsoluteAppBar?: boolean
  themeMode?: ThemeMode
}

export function Header({
  hideAbsoluteAppBar,
  themeMode = ThemeMode.light
}: HeaderProps): ReactElement {
  const trigger = useScrollTrigger()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        <Fade
          in={hideAbsoluteAppBar !== true}
          style={{
            transitionDelay: hideAbsoluteAppBar !== true ? undefined : '2s',
            transitionDuration: '225ms'
          }}
          timeout={{ exit: 2225 }}
          data-testid="Header"
        >
          <LocalAppBar
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 'none'
            }}
            onMenuClick={() => setDrawerOpen(true)}
          />
        </Fade>
      </ThemeProvider>
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
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
