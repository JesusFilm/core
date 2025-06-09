import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../../__generated__/GetJourneyForSharing'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { JourneyFields as JourneyFromContext } from '../../../../../../../__generated__/JourneyFields'

const StyledIframe = styled('iframe')(() => ({}))

interface EmbedCardPreviewProps {
  journey?: JourneyFromContext | JourneyFromLazyQuery
}

export function EmbedCardPreview({
  journey
}: EmbedCardPreviewProps): ReactElement {
  const { rtl } = getJourneyRTL(journey)
  const { t } = useTranslation('apps-journeys-admin')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  const iframeSlug = journey?.slug
  const embedBaseUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

  // Memoize the iframe src to prevent unnecessary re-renders
  const iframeSrc = useMemo(() => {
    return iframeSlug ? `${embedBaseUrl}/embed/${iframeSlug}` : null
  }, [embedBaseUrl, iframeSlug])

  // Consistent dimensions to prevent layout shift
  const dimensions = {
    width: 130,
    height: 200
  }

  // Show placeholder if no journey data
  if (!journey || !iframeSrc) {
    return (
      <Box
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: 'grey.100',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed',
          borderColor: 'grey.300',
          mx: 'auto'
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ px: 1 }}
        >
          {!journey ? t('No journey data') : t('No journey slug')}
        </Typography>
      </Box>
    )
  }

  const handleIframeLoad = (): void => {
    setIframeLoaded(true)
    setIframeError(false)
  }

  const handleIframeError = (): void => {
    setIframeError(true)
    setIframeLoaded(false)
  }

  return (
    <Box
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'grey.100',
        borderRadius: 1,
        mx: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}
    >
      <FramePortal
        width="100%"
        height="100%"
        dir={rtl ? 'rtl' : 'ltr'}
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: 'grey.100'
        }}
      >
        <ThemeProvider
          themeName={journey?.themeName ?? ThemeName.base}
          themeMode={journey?.themeMode ?? ThemeMode.light}
        >
          <Box sx={{ height: '100%', borderRadius: 1, overflow: 'hidden' }}>
            {!iframeLoaded && !iframeError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  borderRadius: 1
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{
                    px: 1,
                    fontSize: '0.75rem',
                    lineHeight: 1.2
                  }}
                >
                  {t('Loading preview...')}
                </Typography>
              </Box>
            )}

            {iframeError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  borderRadius: 1
                }}
              >
                <Typography
                  variant="caption"
                  color="error.main"
                  textAlign="center"
                  sx={{
                    px: 1,
                    fontSize: '0.75rem',
                    lineHeight: 1.2
                  }}
                >
                  {t('Preview unavailable')}
                </Typography>
              </Box>
            )}

            <StyledIframe
              src={iframeSrc}
              loading="lazy"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sx={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: 'none',
                backgroundColor: 'grey.100',
                opacity: iframeLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                borderRadius: 1
              }}
            />
          </Box>
        </ThemeProvider>
      </FramePortal>
    </Box>
  )
}
