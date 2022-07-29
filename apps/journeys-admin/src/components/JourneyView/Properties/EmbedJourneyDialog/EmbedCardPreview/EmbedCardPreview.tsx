import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { FramePortal } from '../../../../FramePortal'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../__generated__/globalTypes'

const CARD_WIDTH = 380

export function EmbedCardPreview(): ReactElement {
  const { journey } = useJourney()
  const block = transformer(journey?.blocks as TreeBlock[])?.[0]

  return (
    <Box
      sx={{
        overflowX: 'auto',
        overflowY: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#DCDDE5',
            width: CARD_WIDTH - 50,
            height: 10,
            borderRadius: '16px 16px 0 0',
            ml: 6
          }}
        />
        <Box
          sx={{
            backgroundColor: '#AAACBB',
            width: CARD_WIDTH - 25,
            height: 10,
            borderRadius: '16px 16px 0 0',
            ml: 3
          }}
        />
        <FramePortal width={CARD_WIDTH} height={560}>
          <ThemeProvider
            themeName={journey?.themeName ?? ThemeName.base}
            themeMode={journey?.themeMode ?? ThemeMode.light}
          >
            <Box sx={{ height: '100%' }}>
              <BlockRenderer
                block={block}
                wrappers={{
                  ImageWrapper: NullWrapper,
                  VideoWrapper: NullWrapper
                }}
              />
            </Box>
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}
