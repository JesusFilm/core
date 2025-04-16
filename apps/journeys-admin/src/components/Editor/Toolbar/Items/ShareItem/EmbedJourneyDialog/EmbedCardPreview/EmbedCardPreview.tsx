import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'

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
          <FramePortal
            width={340}
            height={520}
            dir={rtl ? 'rtl' : 'ltr'}
            sx={{ borderRadius: 5 }}
          >
            <ThemeProvider
              themeName={journey?.themeName ?? ThemeName.base}
              themeMode={journey?.themeMode ?? ThemeMode.light}
            >
              <Box sx={{ height: '100%', borderRadius: 4 }}>
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
