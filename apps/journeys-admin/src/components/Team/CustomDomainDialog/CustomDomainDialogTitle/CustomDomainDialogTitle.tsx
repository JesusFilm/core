import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface CustomDomainDialogTitleProps {
  title: string
  children?: ReactNode
}

export function CustomDomainDialogTitle({
  title,
  children
}: CustomDomainDialogTitleProps): ReactElement {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Stack direction="row" spacing={2}>
        {children}
      </Stack>
    </Stack>
  )
}
