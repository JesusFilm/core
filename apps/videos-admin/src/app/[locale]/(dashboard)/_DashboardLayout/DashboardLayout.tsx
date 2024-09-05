'use client'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Stack from '@mui/material/Stack'
import { ThemeProvider, alpha } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { AppNavbar } from '../../../../components/AppNavbar'
import { Header } from '../../../../components/Header'
import { SideMenu } from '../../../../components/SideMenu'
import { theme } from '../../../../theme'

interface DashboardLayoutProps {
  children?: ReactNode
}

export function DashboardLayout({
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
            overflow: 'auto'
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 10,
              mt: { xs: 8, md: 0 }
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
