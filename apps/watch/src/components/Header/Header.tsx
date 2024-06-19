import MenuIcon from '@mui/icons-material/Menu'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Toolbar from '@mui/material/Toolbar'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import Image from 'next/image'
import NextLink from 'next/link'
import { MouseEventHandler, ReactElement, forwardRef, useState } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { HeaderMenuPanel } from './HeaderMenuPanel'
import { HeaderTabButtons } from './HeaderTabButtons'
import minimalLogo from './assets/minimal-logo.png'

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
                <NextLink href="/watch">
                  <Box
                    sx={{
                      width: { xs: '64px', md: '76px', xl: '88px' },
                      marginLeft: { xs: '-8px', md: '-12px', xl: '0px' }
                    }}
                  >
                    <Image
                      src={minimalLogo}
                      alt="Watch Logo"
                      style={{
                        cursor: 'pointer',
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                  </Box>
                </NextLink>
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
                <IconButton
                  color="inherit"
                  aria-label="open header menu"
                  edge="start"
                  onClick={onMenuClick}
                >
                  <MenuIcon />
                </IconButton>
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
  const trigger = useScrollTrigger()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {hideSpacer !== true && <Box data-testid="HeaderSpacer" height={128} />}
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        {/* <Fade
          appear={false}
          in={hideAbsoluteAppBar !== true}
          style={{
            transitionDelay: hideAbsoluteAppBar !== true ? undefined : '2s',
            transitionDuration: '225ms'
          }}
          timeout={{ exit: 2225 }}
          data-testid="Header"
        > */}
        <LocalAppBar
          sx={{
            background: 'transparent',
            boxShadow: 'none',
            backdropFilter: 'blur(10px)'
          }}
          data-testid="Header"
          position="fixed"
          showDivider={themeMode === ThemeMode.light}
          onMenuClick={() => setDrawerOpen(true)}
        />
        {/* </Fade> */}
      </ThemeProvider>
      {/* <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        <Slide in={trigger}>
          <LocalAppBar
            sx={{
              backgroundColor: 'background.default'
            }}
            position="fixed"
            onMenuClick={() => setDrawerOpen(true)}
          />
        </Slide>
      </ThemeProvider> */}
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
