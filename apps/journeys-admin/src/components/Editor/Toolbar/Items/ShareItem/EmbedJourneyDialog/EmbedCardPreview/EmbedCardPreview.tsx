import Box from '@mui/material/Box'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'

const StyledIframe = styled('iframe')(() => ({}))

interface EmbedCardPreviewProps {
  journeySlug?: string
}

export function EmbedCardPreview({
  journeySlug
}: EmbedCardPreviewProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const iframeSlug = journeySlug ?? (journey?.slug as string)
  const embedBaseUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

  console.log('iframeSlug', iframeSlug)

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
      {iframeSlug != null && (
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
            sx={{ borderRadius: 4, overflow: 'hidden' }}
          >
            <ThemeProvider
              themeName={journey?.themeName ?? ThemeName.base}
              themeMode={journey?.themeMode ?? ThemeMode.light}
            >
              <Box sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                <StyledIframe
                  src={`${embedBaseUrl}/embed/${iframeSlug}`}
                  sx={{
                    width: '100%',
                    height: 600,
                    border: 'none',
                    pointerEvents: 'none'
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
