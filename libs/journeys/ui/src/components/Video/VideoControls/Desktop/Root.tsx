import Stack from '@mui/material/Stack'
import { ReactNode } from 'react'

interface DesktopProps {
  children: ReactNode
}

export function Root({ children }: DesktopProps): JSX.Element {
  return (
    <Stack
      data-testid="desktop-controls"
      direction="row"
      gap={5}
      alignItems="center"
      display={{
        xs: 'none',
        lg: 'flex'
      }}
    >
      {children}
    </Stack>
  )
}
