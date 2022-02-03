import { ReactElement } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@core/shared/ui'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
import {
  TypographyColor,
  ButtonColor,
  IconColor,
  ThemeName,
  ThemeMode
} from '../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../libs/context'

interface ColorDisplayIconProps {
  color: TypographyColor | ButtonColor | IconColor | null
}

export function ColorDisplayIcon({
  color
}: ColorDisplayIconProps): ReactElement {
  const journey = useJourney()
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
    >
      <ThemeProvider
        themeName={card?.themeName ?? journey.themeName ?? ThemeName.base}
        themeMode={card?.themeMode ?? journey.themeMode ?? ThemeMode.dark}
        nested
      >
        <Box
          data-testid={`${color ?? 'primary'}-display-icon`}
          sx={{
            width: 20,
            height: 20,
            m: 0.5,
            borderRadius: 1000,
            backgroundColor: `${color ?? 'primary'}.main`
          }}
        />
      </ThemeProvider>
    </Paper>
  )
}
