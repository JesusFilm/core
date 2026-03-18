import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFields } from '@core/journeys/ui/Step/__generated__/StepFields'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { AiState } from './AiChat/AiChat'

// Card natural dimensions (same as Canvas.tsx)
const CARD_WIDTH = 324
const CARD_HEIGHT = 674

interface AiEditorCardPreviewProps {
  selectedCardId: string | null
  aiState: AiState
  sx?: SxProps
}

export function AiEditorCardPreview({
  selectedCardId,
  aiState,
  sx
}: AiEditorCardPreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const steps = useMemo(
    () => transformer(journey?.blocks ?? []) as Array<TreeBlock<StepFields>>,
    [journey?.blocks]
  )

  // Map "card-N" → steps[N-1]
  const selectedStep = useMemo(() => {
    if (selectedCardId == null) return null
    const match = /^card-(\d+)$/.exec(selectedCardId)
    if (match == null) return null
    const index = parseInt(match[1], 10) - 1
    return steps[index] ?? null
  }, [selectedCardId, steps])

  const { rtl, locale } = getJourneyRTL(journey)

  const theme =
    selectedStep != null ? getStepTheme(selectedStep, journey) : null

  const isAffected =
    selectedCardId != null && aiState.affectedCardIds.includes(selectedCardId)

  // Scale the 324×674 card to fit the container
  const scale = 0.42

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        ...sx
      }}
      data-testid="AiEditorCardPreview"
    >
      {selectedStep == null || theme == null ? (
        <Typography variant="body2" color="text.secondary" align="center">
          {t('Click a screen in the map below to preview it')}
        </Typography>
      ) : (
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              mb: `${-(CARD_HEIGHT * (1 - scale))}px`,
              borderRadius: 8,
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
          >
            <FramePortal
              height="100%"
              width="100%"
              dir={rtl ? 'rtl' : 'ltr'}
              scrolling="no"
            >
              {() => (
                <ThemeProvider {...theme} rtl={rtl} locale={locale}>
                  <BlockRenderer block={selectedStep} />
                </ThemeProvider>
              )}
            </FramePortal>
          </Box>
          {isAffected && aiState.status === 'proposal' && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
                fontSize: '9px',
                fontWeight: 700,
                zIndex: 2
              }}
            >
              {t('AI CHANGE')}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
