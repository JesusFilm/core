import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import take from 'lodash/take'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { CardWrapper } from '@core/journeys/ui/CardWrapper'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { VideoWrapper } from '@core/journeys/ui/VideoWrapper'
import { useTranslation } from 'next-i18next'
import { StepFooter } from '@core/journeys/ui/StepFooter'

interface CardsPreviewProps {
  steps: Array<TreeBlock<StepBlock>>
}

interface CardsPreviewItemProps {
  step: TreeBlock<StepBlock>
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

// Spacing and offsets
const CARD_MARGIN_RIGHT = 7
const EDGE_FADE_PX = 16

function CardsPreviewItem({ step }: CardsPreviewItemProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  return (
    <Box
      sx={{
        position: 'relative',
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        backgroundColor: 'background.default',
        borderRadius: 3
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
            cursor: 'grab'
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
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
          >
            <Box
              sx={{
                height: '100%',
                borderRadius: 4
              }}
            >
              <BlockRenderer
                block={step}
                wrappers={{
                  VideoWrapper,
                  CardWrapper
                }}
              />
            </Box>
            <StepFooter />
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

export function CardsPreview({ steps }: CardsPreviewProps): ReactElement {
  const { t } = useTranslation()

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
            mr: CARD_MARGIN_RIGHT,
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
      slidesPerView="auto"
      spaceBetween={12}
      slidesOffsetBefore={EDGE_FADE_PX}
      observer
      observeParents
      sx={{
        overflow: 'hidden',
        zIndex: 2,
        height: CONTAINER_HEIGHT + 15,
        width: '100%',
        maskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${EDGE_FADE_PX}px, rgba(0,0,0,1) calc(100% - ${EDGE_FADE_PX}px), rgba(0,0,0,0) 100%)`,
        WebkitMaskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${EDGE_FADE_PX}px, rgba(0,0,0,1) calc(100% - ${EDGE_FADE_PX}px), rgba(0,0,0,0) 100%)`
      }}
    >
      {slidesToRender.map((step) => (
        <StyledSwiperSlide
          data-testid="CardsSwiperSlide"
          key={step.id}
          sx={{
            zIndex: 2,
            mr: CARD_MARGIN_RIGHT,
            width: 'unset !important'
          }}
        >
          <CardsPreviewItem step={step} />
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
              mr: CARD_MARGIN_RIGHT,
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
              mr: CARD_MARGIN_RIGHT,
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
              mr: CARD_MARGIN_RIGHT,
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
