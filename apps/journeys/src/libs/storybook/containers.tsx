import Paper from '@mui/material/Paper'
import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'

interface StoryCardProps {
  children: ReactNode
  themeMode?: ThemeMode
  themeName?: ThemeName
}

export const StoryCard = ({
  children,
  themeMode,
  themeName
}: StoryCardProps): ReactElement => {
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

  if (themeMode != null && themeName != null) {
    return (
      <ThemeProvider themeMode={themeMode} themeName={themeName} nested>
        {Card}
      </ThemeProvider>
    )
  } else {
    return Card
  }
}
