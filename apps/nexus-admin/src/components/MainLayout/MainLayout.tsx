import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { FC, ReactNode } from 'react'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  title?: string
  hasBack?: boolean
  children: ReactNode
}

export const MainLayout: FC<MainLayoutProps> = ({
  children,
  title,
  hasBack = false
}) => {
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
        <Header title={title} hasBack={hasBack} />
        <Box>{children}</Box>
      </Stack>
    </Stack>
  )
}
