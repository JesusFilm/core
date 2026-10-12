import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { TreeBlock, transformer } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { CardWrapper } from '@core/journeys/ui/CardWrapper'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { VideoWrapper } from '@core/journeys/ui/VideoWrapper'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName as SharedThemeName } from '@core/shared/ui/themes'

import type {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../__generated__/BlockFields'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'

const FRAME_WIDTH = 360
const FRAME_HEIGHT = 640

// Without a journey the footer shows share/like/dislike by default, but the
// card only makes room for them when the journey turns them on. Turning them
// on here keeps the two in step. Only the fields the card, header and footer
// read are filled in.
const PREVIEW_JOURNEY = {
  language: { __typename: 'Language', id: '529', bcp47: 'en', iso3: 'eng' },
  showShareButton: true,
  showLikeButton: true,
  showDislikeButton: true
} as unknown as Journey

interface AiBuilderPreviewProps {
  blocks: BlockFields[]
}

/**
 * Read-only preview of the draft, one card at a time, with the real block
 * renderer. Taps inside the card are blocked; the arrows change card.
 */
export function AiBuilderPreview({
  blocks
}: AiBuilderPreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const steps = useMemo(
    () => transformer(blocks) as Array<TreeBlock<StepBlock>>,
    [blocks]
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index >= steps.length) setIndex(Math.max(0, steps.length - 1))
  }, [index, steps.length])

  const step = steps[index]
  if (step == null)
    return (
      <Stack
        sx={{
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('Your journey preview will appear here.')}
        </Typography>
      </Stack>
    )

  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  )
  const themeMode = cardBlock?.themeMode ?? ThemeMode.dark

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', p: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton
          aria-label={t('Previous card')}
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'center' }}>
          {t('Card {{current}} of {{total}}', {
            current: index + 1,
            total: steps.length
          })}
        </Typography>
        <IconButton
          aria-label={t('Next card')}
          disabled={index >= steps.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {step.id}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: 3
        }}
        data-testid="AiBuilderPreviewCard"
      >
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 2 }} aria-hidden />
        <FramePortal
          sx={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
          dir="ltr"
        >
          <JourneyProvider value={{ journey: PREVIEW_JOURNEY }}>
            <ThemeProvider
              themeName={SharedThemeName.journeyUi}
              themeMode={themeMode}
              rtl={false}
              locale="en"
            >
              <Box sx={{ position: 'relative', height: '100%' }}>
                <StepHeader
                  steps={steps}
                  selectedStep={step}
                  sx={{ mt: 2, px: 3 }}
                />
                <ThemeProvider
                  themeName={cardBlock?.themeName ?? ThemeName.base}
                  themeMode={themeMode}
                  rtl={false}
                  locale="en"
                  nested
                >
                  <BlockRenderer
                    block={step}
                    wrappers={{ VideoWrapper, CardWrapper }}
                  />
                </ThemeProvider>
                <StepFooter selectedStep={step} />
              </Box>
            </ThemeProvider>
          </JourneyProvider>
        </FramePortal>
      </Box>
    </Stack>
  )
}
