import { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { Header } from '../Header'
import { Footer } from '../Footer'

interface PageWrapperProps {
  hero?: ReactNode
  children?: ReactNode
  hideAbsoluteAppBar?: boolean
}

export function PageWrapper({
  hero,
  children,
  hideAbsoluteAppBar
}: PageWrapperProps): ReactElement {
  return (
    <Div100vh>
      <Stack
        justifyContent="space-between"
        sx={{ width: '100%', height: '100%' }}
      >
        <Header hideAbsoluteAppBar={hideAbsoluteAppBar} />

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
    </Div100vh>
  )
}
