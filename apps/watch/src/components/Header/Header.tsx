import MenuIcon from '@mui/icons-material/Menu'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Toolbar from '@mui/material/Toolbar'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import Image from 'next/image'
import NextLink from 'next/link'
import { MouseEventHandler, ReactElement, forwardRef, useState } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import minimalLogo from './assets/minimal-logo.png'
import { HeaderMenuPanel } from './HeaderMenuPanel'
import { HeaderTabButtons } from './HeaderTabButtons'

interface LocalAppBarProps extends AppBarProps {
  showDivider?: boolean
  onMenuClick: MouseEventHandler<HTMLButtonElement>
}

const LocalAppBar = forwardRef<HTMLDivElement, LocalAppBarProps>(
  ({ onMenuClick, showDivider = false, ...props }, ref) => {
    return (
      <AppBar
        position="absolute"
        {...props}
        sx={{
          p: 4,
          pb: showDivider ? 0 : 4,
          color: 'text.primary',
          ...props.sx
        }}
        ref={ref}
      >
        <Container maxWidth="xxl" disableGutters>
          <Toolbar>
            <Grid
              container
              sx={{
                display: 'grid',
                alignItems: 'center',
                gridTemplateColumns: '1fr auto auto',
                columnGap: 2
              }}
            >
              <Grid item sx={{ gridRow: 1 }}>
                <Box
                  sx={{
                    width: { xs: '64px', md: '76px', xl: '88px' },
                    marginLeft: {
                      xs: '-8px',
                      md: '-14px',
                      xl: '-16px',
                      xxl: '0px'
                    }
                  }}
                >
                  <NextLink href="/watch">
                    <Image
                      src={minimalLogo}
                      alt="Watch Logo"
                      style={{
                        cursor: 'pointer',
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                  </NextLink>
                </Box>
              </Grid>
              <Grid
                item
                sx={{
                  gridRow: { xs: 2, md: 1, lg: 2, xl: 1 },
                  gridColumn: { xs: '1 / 3', md: 2, lg: '1 / 3', xl: 2 },
                  position: 'relative'
                }}
              >
                <HeaderTabButtons />
              </Grid>
              <Grid item sx={{ gridRow: 1 }}>
                <Box
                  data-testid="MenuBox"
                  sx={{
                    marginRight: {
                      xs: '-18px',
                      md: '-14px',
                      lg: '-22px',
                      xl: '-14px',
                      xxl: '2px'
                    }
                  }}
                >
                  <IconButton
                    color="inherit"
                    aria-label="open header menu"
                    edge="start"
                    onClick={onMenuClick}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Toolbar>
        </Container>
        {showDivider && (
          <Divider
            sx={{
              marginTop: '16px',
              mx: '-16px'
            }}
            data-testid="AppBarDivider"
          />
        )}
      </AppBar>
    )
  }
)
LocalAppBar.displayName = 'LocalAppBar'

interface HeaderProps {
  hideAbsoluteAppBar?: boolean
  hideSpacer?: boolean
  themeMode?: ThemeMode
}

export function Header({
  hideAbsoluteAppBar,
  hideSpacer,
  themeMode = ThemeMode.light
}: HeaderProps): ReactElement {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const lightTheme = themeMode === ThemeMode.light

  const lightStyles = {
    backgroundImage:
      'linear-gradient(rgb(255 255 255 / 60%), rgb(255 255 255 / 26%))',
    backdropFilter: 'blur(20px) brightness(1.1)',
    '-webkit-backdrop-filter': 'blur(20px) brightness(1.1)'
  }

  const darkStyles = {
    backgroundImage: 'linear-gradient(rgb(0 0 0 / 60%), rgb(0 0 0 / 26%))',
    backdropFilter: 'blur(20px) brightness(0.9)',
    '-webkit-backdrop-filter': 'blur(20px) brightness(0.9)'
  }

  const appBarStyles = lightTheme ? lightStyles : darkStyles
  const trigger = useScrollTrigger({ disableHysteresis: true })
  return (
    <>
      {hideSpacer !== true && (
        <Box
          data-testid="HeaderSpacer"
          sx={{ height: { xs: 108, md: 120, lg: 168, xl: 132 } }}
        />
      )}
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        <Fade
          appear={false}
          in={hideAbsoluteAppBar !== true || trigger}
          style={{
            transitionDelay:
              hideAbsoluteAppBar !== true || trigger ? undefined : '2s',
            transitionDuration: '225ms'
          }}
          timeout={{ exit: 2225 }}
          data-testid="Header"
        >
          <LocalAppBar
            sx={{
              background: 'transparent',
              boxShadow: 'none',
              '&::before': {
                // content must have empty space https://developer.mozilla.org/en-US/docs/Web/CSS/::before#syntax
                content: "' '",
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                opacity: trigger ? 1 : 0,
                ...appBarStyles,
                transition: 'opacity 0.3s ease'
              }
            }}
            data-testid="Header"
            position="fixed"
            showDivider={lightTheme}
            onMenuClick={() => setDrawerOpen(true)}
          />
        </Fade>
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
