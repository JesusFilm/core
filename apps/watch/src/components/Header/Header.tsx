import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { ReactElement, useState } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { BottomAppBar } from './BottomAppBar'
import { HeaderMenuPanel } from './HeaderMenuPanel'
import { LocalAppBar } from './LocalAppBar'

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

  const theme = useTheme()
  const isXS = useMediaQuery(theme.breakpoints.only('xs'))

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

  const bottomBarTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: isXS ? 100 : 159
  })

  return (
    <>
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        <Box
          sx={{
            background: 'pink'
          }}
        >
          <LocalAppBar
            sx={{
              background: 'transparent',
              color: hideSpacer ? 'background.default' : 'inherit',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
            data-testid="Header"
            showDivider={lightTheme}
            onMenuClick={() => setDrawerOpen(true)}
          />
        </Box>
        <Box sx={{ position: 'relative' }}>
          {!hideSpacer && (
            <Box
              sx={{
                height: 80
              }}
            />
          )}
          <Fade
            appear={false}
            in={hideAbsoluteAppBar !== true || bottomBarTrigger}
            style={{
              transitionDelay:
                hideAbsoluteAppBar !== true || bottomBarTrigger
                  ? undefined
                  : '2s',
              transitionDuration: '225ms'
            }}
            timeout={{ exit: 2225 }}
            data-testid="Header"
          >
            <Stack
              sx={{
                display: 'flex',
                justifyContent: 'center',
                height: 80,
                position: bottomBarTrigger ? 'fixed' : 'absolute',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 3,
                background: 'transparent',
                '&::before': {
                  content: "' '",
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  opacity: bottomBarTrigger ? 1 : 0,
                  ...appBarStyles,
                  transition: 'opacity 0.3s ease'
                }
              }}
            >
              <BottomAppBar data-testid="HeaderBottomBar" />
            </Stack>
          </Fade>
        </Box>
      </ThemeProvider>
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.light}
        nested
      >
        <SwipeableDrawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOpen={() => setDrawerOpen(true)}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.13)'
              }
            }
          }}
          PaperProps={{
            sx: {
              width: '100%',
              background: 'transparent',
              boxShadow: 'none',
              overflowX: 'hidden'
            }
          }}
        >
          <Container
            maxWidth="xl"
            disableGutters
            sx={{
              minHeight: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                minHeight: '100%',
                width: { xs: '100%', md: 500 }
              }}
            >
              <HeaderMenuPanel onClose={() => setDrawerOpen(false)} />
            </Box>
          </Container>
        </SwipeableDrawer>
      </ThemeProvider>
    </>
  )
}
