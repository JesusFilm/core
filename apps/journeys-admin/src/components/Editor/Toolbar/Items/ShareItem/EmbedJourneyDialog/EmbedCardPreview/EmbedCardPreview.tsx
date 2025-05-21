import Box from '@mui/material/Box'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../../../__generated__/GetJourneyForSharing'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { JourneyFields as JourneyFromContext } from '../../../../../../../../__generated__/JourneyFields'

const StyledIframe = styled('iframe')(() => ({}))

interface EmbedCardPreviewProps {
  journey?: JourneyFromContext | JourneyFromLazyQuery
}

export function EmbedCardPreview({
  journey
}: EmbedCardPreviewProps): ReactElement {
  const { rtl } = getJourneyRTL(journey)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const iframeSlug = journey?.slug
  const embedBaseUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

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
