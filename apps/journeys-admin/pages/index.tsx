import { ReactElement } from 'react'
import { Container, Typography } from '@mui/material'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'
import { SignIn } from '../src/components/SignIn'

function Dashboard(): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container sx={{ my: 10 }}>
        <Typography variant={'h1'} sx={{ mb: 8 }}>
          Sign In
        </Typography>
        <SignIn />
      </Container>
    </ThemeProvider>
  )
}

export default Dashboard
