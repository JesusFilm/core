import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  IconColor,
  ThemeMode,
  ThemeName,
  TypographyColor
} from '../../../../../__generated__/globalTypes'

interface ColorDisplayIconProps {
  color: TypographyColor | ButtonColor | IconColor | null
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

  const card = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock> | undefined

  return (
    <Paper
      sx={{
        borderRadius: 1000
      }}
      data-testid="ColorDisplayIcon"
    >
      <ThemeProvider
        themeName={card?.themeName ?? journey?.themeName ?? ThemeName.base}
        themeMode={card?.themeMode ?? journey?.themeMode ?? ThemeMode.dark}
        nested
      >
        <Box
          data-testid={`${color ?? 'primary'}-display-icon`}
          sx={{
            width: 20,
            height: 20,
            m: 0.5,
            borderRadius: 1000,
            backgroundColor:
              color !== null ? DisplayColor[color] : DisplayColor.primary
          }}
        />
      </ThemeProvider>
    </Paper>
  )
}
