import { useTheme } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'
import { CardWrapper } from '../../components/blocks/Card'

interface StoryCardProps {
  id?: string
  backgroundColor?: string
  themeMode?: ThemeMode
  children: ReactNode
}

export const StoryCard = ({
  id,
  children,
  backgroundColor,
  themeMode
}: StoryCardProps): ReactElement => {
  const theme = useTheme()

  return (
    <CardWrapper
      id={id ?? ''}
      backgroundColor={backgroundColor ?? null}
      themeName={ThemeName.base}
      themeMode={themeMode ?? (theme.palette.mode as ThemeMode)}
    >
      {children}
    </CardWrapper>
  )
}
