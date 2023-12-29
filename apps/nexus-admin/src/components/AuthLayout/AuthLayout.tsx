import { Stack } from '@mui/material'
import { FC, ReactNode } from 'react'

import { AuthNavBar } from './AuthNavBar'

interface AuthLayoutProps {
  children: ReactNode
}

export const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Stack direction="column" sx={{ height: '100vh' }}>
      <AuthNavBar />
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          flex: 1,
          backgroundColor: '#F6F5F6'
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
