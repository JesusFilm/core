import { Paper } from '@mui/material'
import { ReactElement, ReactNode } from 'react'

interface StoryCardProps {
  children: ReactNode
}

export const StoryCard = ({ children }: StoryCardProps): ReactElement => {
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 7,
        borderRadius: (theme) => theme.spacing(4)
      }}
      elevation={3}
    >
      {children}
    </Paper>
  )
}
