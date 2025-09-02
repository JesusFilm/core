'use client'
import CssBaseline from '@mui/material/CssBaseline'
import Stack from '@mui/material/Stack'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'
import { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Not Found',
  description:
    "Sorry, the page you are looking for doesn't exist or has been moved."
}

export default function notFound(): ReactElement {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ minHeight: '100vh' }}
      >
        <Typography variant="h4" component="h1">
          We've Lost This Page
        </Typography>
        <Typography variant="h5" component="h2">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </Typography>
      </Stack>
    </ThemeProvider>
  )
}
