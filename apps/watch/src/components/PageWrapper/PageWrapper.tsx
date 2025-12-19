import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'
import Div100vh from 'react-div-100vh'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
// Used to resolve dynamic viewport height on Safari
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { Footer } from '../Footer'

interface PageWrapperProps {
  hero?: ReactNode
  children?: ReactNode
  'data-testid'?: string
  hideFooter?: boolean
  isFullscreen?: boolean
}

export function PageWrapper({
  hero,
  children,
  'data-testid': testId,
  hideFooter = false,
  isFullscreen = false
}: PageWrapperProps): ReactElement {
  return (
    <Div100vh>
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
