import { ReactElement, useContext } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@core/shared/ui'
import { TreeBlock, EditorContext } from '@core/journeys/ui'
import { useJourney } from '../../../../libs/context'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
import { TypographyColor } from '../../../../../__generated__/globalTypes'

interface ColorDisplayIconProps {
  color: TypographyColor | null
}

export function ColorDisplayIcon({
  color
}: ColorDisplayIconProps): ReactElement {
  const {
    state: { selectedStep }
  } = useContext(EditorContext)

  const journey = useJourney()

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
        themeName={card?.themeName ?? journey.themeName}
        themeMode={card?.themeMode ?? journey.themeMode}
      >
        <Box
          data-testid="backgroundColorIcon"
          sx={{
            width: 20,
            height: 20,
            m: 1,
            borderRadius: 1000,
            backgroundColor: `${color ?? 'primary'}.main`
          }}
        />
      </ThemeProvider>
    </Paper>
  )
}
