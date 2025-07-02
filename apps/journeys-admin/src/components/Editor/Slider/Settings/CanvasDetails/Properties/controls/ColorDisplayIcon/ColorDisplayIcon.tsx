import { ReactElement } from 'react'
import { useTheme } from '@mui/material/styles'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  IconColor,
  TypographyColor
} from '../../../../../../../../../__generated__/globalTypes'

interface ColorDisplayIconProps {
  color: TypographyColor | ButtonColor | IconColor | string | null
}

enum DisplayColor {
  primary = 'primary.main',
  secondary = 'secondary.main',
  error = 'error.main',
  inherit = 'primary.contrastText'
}

export function ColorDisplayIcon({
  color
}: ColorDisplayIconProps): ReactElement {
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const theme = useTheme()

  const card = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock> | undefined

  // If color is a hex code (string), use it directly
  if (typeof color === 'string' && color.startsWith('#')) {
    return (
      <span
        style={{
          backgroundColor: color,
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          display: 'inline-block'
        }}
      />
    )
  }

  // For enum values, use the theme colors
  const getDisplayColor = (): string => {
    if (card?.fullscreen === true) {
      return theme.palette.primary.contrastText
    }

    switch (color) {
      case 'primary':
        return theme.palette.primary.main
      case 'secondary':
        return theme.palette.secondary.main
      case 'error':
        return theme.palette.error.main
      case 'inherit':
        return theme.palette.primary.contrastText
      default:
        return theme.palette.primary.main
    }
  }

  return (
    <span
      style={{
        backgroundColor: getDisplayColor(),
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        display: 'inline-block'
      }}
    />
  )
}
