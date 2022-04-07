import Paper from '@mui/material/Paper'
import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '@core/shared/ui'
import { SxProps } from '@mui/system/styleFunctionSx'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'

interface StoryCardProps {
  children: ReactNode
  themeMode?: ThemeMode
  themeName?: ThemeName
  sx?: SxProps
}

export const StoryCard = ({
  children,
  themeMode,
  themeName,
  sx
}: StoryCardProps): ReactElement => {
  const Card = (
    <Paper
      sx={{
        p: 7,
        borderRadius: (theme) => theme.spacing(4),
        '& > *': {
          '&:first-child': { mt: 0 },
          '&:last-child': { mb: 0 }
        },
        ...sx
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
