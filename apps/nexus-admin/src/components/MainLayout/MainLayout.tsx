import { Box, Stack } from '@mui/material'
import { FC, ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <Stack
      direction="row"
      sx={{
        minHeight: '100vh'
      }}
    >
      <Sidebar />
      <Stack
        sx={{
          flex: 1,
          backgroundColor: '#F6F5F6',
          overflowY: 'auto',
          py: 2,
          px: 3
        }}
      >
        <Header title="Title" />
        <Box>{children}</Box>
      </Stack>
    </Stack>
  )
}
