import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'
import Div100vh from 'react-div-100vh'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
// Used to resolve dynamic viewport height on Safari
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { Footer } from '../Footer'
import { Header } from '../Header'
import { LocaleSuggestionBanner } from '../LocaleSuggestionBanner'

interface PageWrapperProps {
  hero?: ReactNode
  children?: ReactNode
  hideHeader?: boolean
  hideHeaderSpacer?: boolean
  testId?: string
  headerThemeMode?: ThemeMode
  hideFooter?: boolean
  isFullscreen?: boolean
  showLanguageSwitcher?: boolean
}

export function PageWrapper({
  hero,
  children,
  hideHeader,
  hideHeaderSpacer,
  testId,
  headerThemeMode,
  hideFooter = false,
  isFullscreen = false,
  showLanguageSwitcher = false
}: PageWrapperProps): ReactElement {
  return (
    <Div100vh>
      <LocaleSuggestionBanner />
      {hideHeader !== true && (
        <Header
          themeMode={headerThemeMode}
          hideSpacer={hideHeaderSpacer}
          showLanguageSwitcher={showLanguageSwitcher}
        />
      )}
      <Stack
        justifyContent="space-between"
        sx={{
          width: '100%',
          height: '100%',
          overflowX: isFullscreen ? 'hidden' : 'clip'
        }}
        data-testid={testId}
      >
        <Container maxWidth={false} disableGutters>
          <ThemeProvider
            nested
            themeName={ThemeName.website}
            themeMode={ThemeMode.dark}
          >
            {hero}
          </ThemeProvider>
        </Container>
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
        {hideFooter !== true && <Footer />}
      </Stack>
    </Div100vh>
  )
}
