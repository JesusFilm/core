import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface TagItemProps {
  name: string
  icon: ReactNode
}

export function TagItem({ name, icon }: TagItemProps): ReactElement {
  return (
    <Stack alignItems="center" gap={2} sx={{ minWidth: '99px', width: '99px' }}>
      {icon}
      <Typography variant="body2">{name}</Typography>
    </Stack>
  )
}
