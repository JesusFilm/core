import { ReactElement, ReactNode } from 'react'
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
}

export function PageWrapper({
  hero,
  children
}: PageWrapperProps): ReactElement {
  return (
    <Div100vh>
      <Stack
        justifyContent="space-between"
        sx={{ width: '100%', height: '100%' }}
      >
        <Header />

        <Container maxWidth={false} disableGutters>
          <ThemeProvider
            nested
            themeName={ThemeName.website}
            themeMode={ThemeMode.dark}
          >
            {hero}
          </ThemeProvider>
        </Container>
        <Container maxWidth="xl" sx={{ flexGrow: 1 }}>
          {children}
        </Container>

        <Footer />
      </Stack>
    </Div100vh>
  )
}
