import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import MenuIcon from '@mui/icons-material/Menu'
import { ReactElement, useState } from 'react'
import { useInstantSearchContext } from 'react-instantsearch'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { HeaderMenuPanel } from './HeaderMenuPanel'
import { LanguageSelector } from '../SearchComponent/LanguageSelector'

/**
 * Props for the Header component.
 * @interface HeaderProps
 */
interface HeaderProps {
  /** Theme mode to apply to the header. */
  themeMode?: ThemeMode
  /** Display Algolia language filter in the header. */
  showLanguageSwitcher?: boolean
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
  themeMode = ThemeMode.light,
  showLanguageSwitcher = false
}: HeaderProps): ReactElement {
  /** State to control the drawer open/closed state. */
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <ThemeProvider themeName={ThemeName.website} themeMode={themeMode} nested>
        <Box
          component="header"
          sx={{
            width: '100%',
            px: { xs: 4, md: 6 },
            py: { xs: 3, md: 4 },
            display: 'flex',
            alignItems: 'center',
            gap: 3
          }}
        >
          <IconButton
            aria-label="open header menu"
            aria-expanded={drawerOpen}
            className={drawerOpen ? 'expanded' : undefined}
            onClick={() => setDrawerOpen(true)}
            data-testid="MenuIcon"
            size="large"
            sx={{
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              p: 1.5
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {showLanguageSwitcher === true && (
              <Box sx={{ width: { xs: '100%', sm: 300 }, maxWidth: 360 }}>
                <HeaderLanguageSelector />
              </Box>
            )}
          </Box>
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

function HeaderLanguageSelector(): ReactElement | null {
  try {
    useInstantSearchContext()
  } catch {
    return null
  }

  return <LanguageSelector />
}
