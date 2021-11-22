import { ReactElement } from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import Link from 'next/link'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'

function Dashboard(): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container sx={{ my: 10 }}>
        <Typography variant={'h1'} sx={{ mb: 8 }}>
          Dashboard
        </Typography>
        <Box my={2}>
          <Link href={`/journeys`} passHref>
            <Button variant="contained" fullWidth>
              Journeys List
            </Button>
          </Link>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default Dashboard
