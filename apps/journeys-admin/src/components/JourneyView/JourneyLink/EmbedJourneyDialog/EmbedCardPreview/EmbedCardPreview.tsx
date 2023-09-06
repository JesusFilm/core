import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { FramePortal } from '../../../../FramePortal'

const CARD_WIDTH = 340

export function EmbedCardPreview(): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const block = transformer(journey?.blocks as TreeBlock[])?.[0]
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Box
      sx={{
        width: 195,
        position: 'relative',
        height: 294,
        mb: '-24px',
        overflow: 'hidden'
      }}
    >
      {block != null && (
        <Box
          sx={{
            transform: 'scale(0.5)',
            transformOrigin: smUp ? 'top left' : '22.5% top'
          }}
        >
          <Box
            sx={{
              ml: 7,
              mb: '-3.5px',
              height: 12,
              width: CARD_WIDTH - 55,
              backgroundColor: '#DCDDE5',
              borderRadius: '16px 16px 0 0'
            }}
          />
          <Box
            sx={{
              ml: 3.5,
              mb: '-3.5px',
              height: 12,
              width: CARD_WIDTH - 30,
              backgroundColor: '#AAACBB',
              borderRadius: '16px 16px 0 0'
            }}
          />
          <FramePortal width={340} height={520} dir={rtl ? 'rtl' : 'ltr'}>
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
      )}
    </Box>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}
