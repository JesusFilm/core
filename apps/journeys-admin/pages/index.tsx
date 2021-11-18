import { ReactElement } from 'react'
import { Container, Typography } from '@mui/material'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'
import { Wrapper } from '../src/components/UserAuthentication/Wrapper'

function Dashboard(): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container sx={{ my: 10 }}>
        <Typography variant={'h1'} sx={{ mb: 8 }}>
          Dashboard
        </Typography>
        <Wrapper />
      </Container>
    </ThemeProvider>
  )
}

export default Dashboard
