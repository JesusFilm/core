'use client'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Stack from '@mui/material/Stack'
import { ThemeProvider, alpha } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { theme } from '../../theme'

import { AppNavbar } from './_AppNavbar'
import { Header } from './_Header'
import { SideMenu } from './_SideMenu'

interface DashboardLayoutProps {
  children?: ReactNode
}

export default function DashboardLayout({
  children
}: DashboardLayoutProps): ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100svh'
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 10,
              mt: { xs: 8, md: 0 },
              height: '100%'
            }}
          >
            <Header />
            {children}
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
