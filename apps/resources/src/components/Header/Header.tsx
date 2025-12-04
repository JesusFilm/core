import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
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

/**
 * Props for the Header component.
 * @interface HeaderProps
 */
interface HeaderProps {
  /** Flag to hide the top app bar. */
  hideTopAppBar?: boolean
  /** Flag to hide the bottom app bar. */
  hideBottomAppBar?: boolean
  /** Flag to hide the spacer element (only needed on /watch). */
  hideSpacer?: boolean
  /** Theme mode to apply to the header. */
  themeMode?: ThemeMode
  showLanguageSwitcher?: boolean
}

/**
 * Header component for the application.
 *
 * Renders a responsive header with top and bottom app bars, and a swipeable drawer
 * for navigation menu. The component adapts its appearance based on screen size,
 * scroll position, and feature flags.
 *
 * @param {HeaderProps} props - Component props.
 * @returns {ReactElement} Rendered Header component.
 */
export function Header({
  hideTopAppBar,
  hideBottomAppBar,
  hideSpacer,
  themeMode = ThemeMode.light,
  showLanguageSwitcher = false
}: HeaderProps): ReactElement {
  /** State to control the drawer open/closed state. */
  const [drawerOpen, setDrawerOpen] = useState(false)
  /** Current theme from MUI ThemeProvider. */
  const theme = useTheme()
  /** Boolean indicating if the current viewport is extra small. */
  const isXS = useMediaQuery(theme.breakpoints.only('xs'))
  /** Boolean indicating if the current theme is light mode. */
  const lightTheme = themeMode === ThemeMode.light
  /** Feature flags for strategies and journeys. */
  const { strategies, journeys } = useFlags()

  /**
   * Scroll trigger that activates based on scroll position.
   * Uses different threshold values based on screen size.
   */
  const bottomBarTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: isXS ? 100 : 159
  })

  /** Determines if the bottom app bar should be displayed based on feature flags. */
  const shouldShowBottomAppBar = strategies || journeys
  /** Determines if the bottom app bar should fade based on props and scroll position. */
  const shouldFade = hideBottomAppBar !== true || bottomBarTrigger

  return (
    <>
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        {!hideTopAppBar && (
          <Box sx={{ background: 'background.default' }}>
            <LocalAppBar
              hideSpacer={hideSpacer}
              onMenuClick={() => setDrawerOpen((prev) => !prev)}
              menuOpen={drawerOpen}
              showLanguageSwitcher={showLanguageSwitcher}
            />
          </Box>
        )}
        {shouldShowBottomAppBar && (
          <Box sx={{ position: 'relative' }}>
            {!hideSpacer && (
              <Box data-testid="HeaderSpacer" sx={{ height: 80 }} />
            )}
            <BottomAppBar
              lightTheme={lightTheme}
              bottomBarTrigger={bottomBarTrigger}
              shouldFade={shouldFade}
            />
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
              overflowX: 'hidden',
              overscrollBehaviorY: 'none'
            },
            onClick: () => setDrawerOpen(false)
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
            <Box
              sx={{
                minHeight: '100%',
                width: { xs: '100%', lg: 530 }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <HeaderMenuPanel onClose={() => setDrawerOpen(false)} />
            </Box>
          </Container>
        </SwipeableDrawer>
      </ThemeProvider>
    </>
  )
}
