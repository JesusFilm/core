import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'
import { use100vh } from 'react-div-100vh'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
// Used to resolve dynamic viewport height on Safari
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { Footer } from '../Footer'
import { Header } from '../Header'

interface PageWrapperProps {
  hero?: ReactNode
  children?: ReactNode
  hideHeader?: boolean
  testId?: string
}

export function PageWrapper({
  hero,
  children,
  hideHeader,
  testId
}: PageWrapperProps): ReactElement {
  const viewportHeight = use100vh()
  return (
    <Box
      sx={{
        height: viewportHeight ?? '100vh',
        minHeight: '-webkit-fill-available'
      }}
    >
      <Stack
        justifyContent="space-between"
        sx={{ width: '100%', height: '100%' }}
        data-testid={testId}
      >
        {hideHeader !== true && <Header />}
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
        <Footer />
      </Stack>
    </Box>
  )
}
