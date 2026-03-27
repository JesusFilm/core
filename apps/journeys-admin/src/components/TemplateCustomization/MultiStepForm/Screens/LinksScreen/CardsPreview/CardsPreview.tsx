import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import take from 'lodash/take'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { CardWrapper } from '@core/journeys/ui/CardWrapper'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFields } from '@core/journeys/ui/Step/__generated__/StepFields'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { VideoWrapper } from '@core/journeys/ui/VideoWrapper'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName as SharedThemeName } from '@core/shared/ui/themes'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'

interface CardsPreviewProps {
  steps: Array<TreeBlock<StepBlock>>
  onCardClick?: (step: TreeBlock<StepBlock>) => void
}

interface CardsPreviewItemProps {
  step: TreeBlock<StepBlock>
  onClick?: (step: TreeBlock<StepBlock>) => void
  steps?: Array<TreeBlock<StepBlock>>
}

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))
const StyledSwiper = styled(Swiper)(() => ({}))

// Unified base dimensions (same at all breakpoints)
const CONTAINER_WIDTH = 140

// Frame dimensions for the unscaled card
const FRAME_WIDTH = 445
const FRAME_HEIGHT = 773

// Derived scaling and height so frame fits container
const IFRAME_SCALE = CONTAINER_WIDTH / FRAME_WIDTH
const CONTAINER_HEIGHT = Math.round(FRAME_HEIGHT * IFRAME_SCALE)


function CardsPreviewItem({
  step,
  onClick,
  steps
}: CardsPreviewItemProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  return (
    <Box
      onClick={onClick != null ? () => onClick(step) : undefined}
      onKeyDown={
        onClick != null
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(step)
              }
            }
          : undefined
      }
      role={onClick != null ? 'button' : undefined}
      tabIndex={onClick != null ? 0 : undefined}
      aria-label={
        onClick != null ? `Open preview for card ${step.id}` : undefined
      }
      sx={{
        position: 'relative',
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        backgroundColor: 'background.default',
        borderRadius: 3,
        cursor: onClick != null ? 'pointer' : undefined
      }}
      data-testid="CardsPreviewItem"
    >
      <Box
        sx={{
          transform: `scale(${IFRAME_SCALE})`,
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            zIndex: 2,
            cursor: onClick != null ? 'pointer' : 'grab'
          }}
        />
        <FramePortal
          sx={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT
          }}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <ThemeProvider
            themeName={SharedThemeName.journeyUi}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
          >
            <Box
              sx={{
                position: 'relative',
                height: '100%',
                borderRadius: 4
              }}
            >
              <StepHeader
                steps={steps as unknown as Array<TreeBlock<StepFields>>}
                selectedStep={step as unknown as TreeBlock<StepFields>}
                sx={{ mt: 2, px: 3 }}
              />
              <ThemeProvider
                themeName={cardBlock?.themeName ?? ThemeName.base}
                themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
                rtl={rtl}
                locale={locale}
                nested
              >
                <BlockRenderer
                  block={step}
                  wrappers={{
                    VideoWrapper,
                    CardWrapper
                  }}
                />
              </ThemeProvider>
              <StepFooter
                selectedStep={step as unknown as TreeBlock<StepFields>}
              />
            </Box>
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

export function CardsPreview({
  steps,
  onCardClick
}: CardsPreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const slidesToRender: Array<TreeBlock<StepBlock>> = take(steps, 7)

  if (steps.length === 0) {
    return (
      <Stack
        data-testid="CardsPreviewPlaceholder"
        direction="row"
        sx={{ overflowY: 'visible' }}
      >
        <Skeleton
          variant="rounded"
          data-testid="CardsPreviewSkeleton"
          sx={{
            minWidth: CONTAINER_WIDTH,
            height: CONTAINER_HEIGHT,
            borderRadius: 2
          }}
        />
      </Stack>
    )
  }

  return (
    <StyledSwiper
      modules={[Mousewheel, FreeMode, A11y]}
      mousewheel={{
        forceToAxis: true
      }}
      freeMode
      watchOverflow
      centerInsufficientSlides
      slidesPerView="auto"
      spaceBetween={12}
      observer
      observeParents
      sx={{
        pr: 2,
        overflow: 'hidden',
        zIndex: 2,
        height: CONTAINER_HEIGHT + 15,
        width: '100%'
      }}
    >
      {slidesToRender.map((step) => (
        <StyledSwiperSlide
          data-testid="CardsSwiperSlide"
          key={step.id}
          sx={{
            zIndex: 2,
            width: 'unset !important'
          }}
        >
          <CardsPreviewItem
            step={step}
            onClick={onCardClick}
            steps={slidesToRender}
          />
        </StyledSwiperSlide>
      ))}
      {steps.length > slidesToRender.length && (
        <StyledSwiperSlide
          data-testid="CardsRemainingSlide"
          sx={{
            width: 'unset !important',
            cursor: 'grab',
            zIndex: 2
          }}
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            gap={2}
            sx={{
              width: CONTAINER_WIDTH,
              height: CONTAINER_HEIGHT,
              borderRadius: 2,
              backgroundColor: 'secondary.main',
              px: 1
            }}
          >
            <Typography
              variant="overline2"
              color="background.paper"
              textAlign="center"
            >
              {t('{{count}} more cards', {
                count: steps.length - slidesToRender.length
              })}
            </Typography>
          </Stack>
          <Box
            sx={{
              position: 'relative',
              bottom: CONTAINER_HEIGHT - 5,
              left: 10,
              zIndex: -1,
              minWidth: CONTAINER_WIDTH,
              height: CONTAINER_HEIGHT,
              borderRadius: 2,
              backgroundColor: 'secondary.light'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: 21,
              top: 11,
              zIndex: -2,
              minWidth: CONTAINER_WIDTH,
              height: CONTAINER_HEIGHT,
              borderRadius: 2,
              backgroundColor: 'divider'
            }}
          />
        </StyledSwiperSlide>
      )}
    </StyledSwiper>
  )
}
