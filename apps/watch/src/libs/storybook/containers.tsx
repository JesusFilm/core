import Paper from '@mui/material/Paper'
import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '../../components/ThemeProvider'

interface StoryCardProps {
  children: ReactNode
}

export const StoryCard = ({ children }: StoryCardProps): ReactElement => {
  const Card = (
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

  return <ThemeProvider>{Card}</ThemeProvider>
}
