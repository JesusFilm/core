import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  ReactElement,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState
} from 'react'

import { TreeBlock, transformer } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName as SharedThemeName } from '@core/shared/ui/themes'
import type { FontFamilies } from '@core/shared/ui/themes'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import type {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../__generated__/BlockFields'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { AiBuilderCard } from '../AiBuilderCard'
import { AiBuilderVideo } from '../AiBuilderVideo'

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
  journey?: Record<string, unknown> | null
}

/**
 * Read-only preview of the draft, one card at a time, with the real block
 * renderer. Taps inside the card are blocked; the arrows change card.
 */
export function AiBuilderPreview({
  blocks,
  journey
}: AiBuilderPreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const steps = useMemo(
    () => transformer(blocks) as Array<TreeBlock<StepBlock>>,
    [blocks]
  )
  const [index, setIndex] = useState(0)
  const previewJourney = useMemo(() => {
    const language =
      journey?.language != null && typeof journey.language === 'object'
        ? (journey.language as Record<string, unknown>)
        : {}
    return {
      ...PREVIEW_JOURNEY,
      language: {
        ...PREVIEW_JOURNEY.language,
        id: typeof language.id === 'string' ? language.id : '529',
        bcp47: typeof language.bcp47 === 'string' ? language.bcp47 : 'en'
      }
    }
  }, [journey?.language])
  const { rtl, locale } = getJourneyRTL(previewJourney)
  const fontFamilies = useMemo<FontFamilies | undefined>(() => {
    if (journey?.fonts == null || typeof journey.fonts !== 'object')
      return undefined
    const fonts = journey.fonts as Record<string, unknown>
    return {
      headerFont: typeof fonts.headerFont === 'string' ? fonts.headerFont : '',
      bodyFont: typeof fonts.bodyFont === 'string' ? fonts.bodyFont : '',
      labelFont: typeof fonts.labelFont === 'string' ? fonts.labelFont : ''
    }
  }, [journey?.fonts])

  useEffect(() => {
    if (index >= steps.length) setIndex(Math.max(0, steps.length - 1))
  }, [index, steps.length])

  // Block activation before it reaches a block, without covering its scroll area.
  function handlePreviewInteraction(event: SyntheticEvent): void {
    const target = event.target as Element | null
    if (
      event.type !== 'submit' &&
      target?.closest?.('[data-ai-preview-video]') != null
    )
      return
    event.preventDefault()
    event.stopPropagation()
  }

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
  const themeMode =
    cardBlock?.themeMode ??
    (journey?.theme === 'light' ? ThemeMode.light : ThemeMode.dark)
  const video = cardBlock?.children.find(
    (child) => child.__typename === 'VideoBlock'
  )

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
      {video?.__typename === 'VideoBlock' && (
        <Typography variant="caption" color="text.secondary">
          {video.title} ·{' '}
          {t('Clip {{start}} to {{end}}', {
            start: secondsToTimeFormat(video.startAt ?? 0, {
              trimZeroes: true
            }),
            end:
              video.endAt != null
                ? secondsToTimeFormat(video.endAt, { trimZeroes: true })
                : t('end')
          })}
        </Typography>
      )}
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
        <FramePortal
          sx={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
          dir={rtl ? 'rtl' : 'ltr'}
          fontFamilies={fontFamilies}
        >
          <JourneyProvider value={{ journey: previewJourney }}>
            <ThemeProvider
              themeName={SharedThemeName.journeyUi}
              themeMode={themeMode}
              rtl={rtl}
              locale={locale}
              fontFamilies={fontFamilies}
            >
              <Box
                sx={{ position: 'relative', height: '100%' }}
                onClickCapture={handlePreviewInteraction}
                onAuxClickCapture={handlePreviewInteraction}
                onSubmitCapture={handlePreviewInteraction}
              >
                <StepHeader
                  steps={steps}
                  selectedStep={step}
                  sx={{ mt: 2, px: 3 }}
                />
                <ThemeProvider
                  themeName={cardBlock?.themeName ?? ThemeName.base}
                  themeMode={themeMode}
                  rtl={rtl}
                  locale={locale}
                  nested
                  fontFamilies={fontFamilies}
                >
                  <BlockRenderer
                    block={step}
                    wrappers={{
                      VideoWrapper: AiBuilderVideo,
                      CardWrapper: AiBuilderCard
                    }}
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
