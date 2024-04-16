import { Stack, Typography } from '@mui/material'
import { FC } from 'react'

interface TableHeaderProps {
  title: string
  subtitle: string
}

export const TableHeader: FC<TableHeaderProps> = ({ title, subtitle }) => {
  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">{title}</Typography>
      <Typography variant="subtitle3">{subtitle}</Typography>
    </Stack>
  )
}
