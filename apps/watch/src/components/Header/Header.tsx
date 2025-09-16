import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import { ReactElement, useState } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { HeaderMenuPanel } from './HeaderMenuPanel'

/**
 * Props for the Header component.
 * @interface HeaderProps
 */
interface HeaderProps {
  /** Theme mode to apply to the header. */
  themeMode?: ThemeMode
}

/**
 * Header component for the application.
 *
 * Renders a swipeable drawer for navigation menu.
 *
 * @param {HeaderProps} props - Component props.
 * @returns {ReactElement} Rendered Header component.
 */
export function Header({
  themeMode = ThemeMode.light
}: HeaderProps): ReactElement {
  /** State to control the drawer open/closed state. */
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
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
