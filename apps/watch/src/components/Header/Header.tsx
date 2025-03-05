import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import { useTheme } from '@mui/material/styles'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { ReactElement, useState } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'
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
  const { strategies, journeys } = useFlags()

  const bottomBarTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: isXS ? 100 : 159
  })

  const shouldShowBottomAppBar = strategies || journeys
  const shouldFade = hideAbsoluteAppBar !== true || bottomBarTrigger

  return (
    <>
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        <Box sx={{ background: 'background.default' }}>
          <LocalAppBar
            hideSpacer={hideSpacer}
            onMenuClick={() => setDrawerOpen((prev) => !prev)}
            menuOpen={drawerOpen}
          />
        </Box>
        {shouldShowBottomAppBar && (
          <Box sx={{ position: 'relative' }}>
            {!hideSpacer && (
              <Box data-testid="HeaderSpacer" sx={{ height: 80 }} />
            )}
            <Fade
              appear={false}
              in={shouldFade}
              style={{
                transitionDelay: shouldFade ? undefined : '2s',
                transitionDuration: '225ms'
              }}
              timeout={{ exit: 2225 }}
            >
              <BottomAppBar
                lightTheme={lightTheme}
                bottomBarTrigger={bottomBarTrigger}
              />
            </Fade>
          </Box>
        )}
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
            backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.13)' } }
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
            maxWidth="xxl"
            disableGutters
            sx={{
              minHeight: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'relative'
            }}
          >
            <Box sx={{ minHeight: '100%', width: { xs: '100%', lg: 530 } }}>
              <HeaderMenuPanel onClose={() => setDrawerOpen(false)} />
            </Box>
          </Container>
        </SwipeableDrawer>
      </ThemeProvider>
    </>
  )
}
