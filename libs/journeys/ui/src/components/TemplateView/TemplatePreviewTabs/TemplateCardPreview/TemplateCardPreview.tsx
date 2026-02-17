import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import take from 'lodash/take'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { TreeBlock } from '../../../../libs/block'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'
import { TemplateActionButton } from '../../TemplateViewHeader/TemplateActionButton/TemplateActionButton'

import {
  SELECTED_SCALE,
  type TemplateCardPreviewVariant,
  VARIANT_CONFIGS
} from './templateCardPreviewConfig'
import { TemplateCardPreviewItem } from './TemplateCardPreviewItem'

interface TemplateCardPreviewProps {
  steps?: Array<TreeBlock<StepBlock>>
  authUser?: User
  variant?: TemplateCardPreviewVariant
  onClick?: (step: TreeBlock<StepBlock>) => void
  selectedStep?: TreeBlock<StepBlock> | null
}

interface TemplateCardPreviewPlaceholderProps {
  cardWidth: { xs: number; sm: number }
  cardHeight: { xs: number; sm: number }
}

function TemplateCardPreviewPlaceholder({
  cardWidth,
  cardHeight
}: TemplateCardPreviewPlaceholderProps) {
  return (
    <Stack
      data-testid="TemplateCardsPreviewPlaceholder"
      direction="row"
      sx={{ overflowY: 'visible' }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((value) => (
        <Skeleton
          variant="rounded"
          key={value}
          data-testid="TemplateCardSkeleton"
          sx={{
            minWidth: cardWidth,
            mr: { xs: 3, sm: 7 },
            height: cardHeight,
            borderRadius: 2
          }}
        />
      ))}
    </Stack>
  )
}

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))
const StyledSwiper = styled(Swiper)(() => ({}))

/**
 * Horizontal carousel of template step cards with optional "more cards" slide.
 *
 * TemplateCardPreview has two variants:
 *
 * 'preview': Renders the first 7 steps plus a “use this template” call-to-action. Used on the /templates page.
 *
 * 'media': Renders the full list of customizable media steps with selection state. Used in the template customization flow.
 *
 * @param props - Component props
 * @param props.steps - Journey step blocks to display as cards
 * @param props.authUser - Authenticated user for CTA sign-in state
 * @param props.variant - 'preview' | 'media'; controls layout and behaviour
 * @param props.onClick - Handler when a card is clicked
 * @param props.selectedStep - Selected step (media variant)
 * @returns Carousel UI or skeleton placeholder when steps are loading
 */
export function TemplateCardPreview({
  steps,
  authUser,
  variant = 'preview',
  onClick,
  selectedStep
}: TemplateCardPreviewProps): ReactElement {
  const { breakpoints } = useTheme()
  const { t } = useTranslation('libs-journeys-ui')
  const [swiper, setSwiper] = useState<SwiperClass>()

  const config = VARIANT_CONFIGS[variant]
  const {
    cardWidth,
    cardHeight,
    swiperHeight,
    showMoreCardsSlide,
    swiperProps,
    slideSx,
    swiperSx,
    modules
  } = config

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      spaceBetween: 12,
      slidesOffsetAfter: variant === 'media' ? 200 : 0
    },
    [breakpoints.values.sm]: {
      spaceBetween: variant === 'preview' ? 28 : 12,
      slidesOffsetAfter: variant === 'media' ? 400 : 0
    }
  }

  const slidesToRender =
    steps != null
      ? variant === 'media'
        ? steps
        : take(steps, 7)
      : []

  useEffect(() => {
    if (
      variant !== 'media' ||
      swiper == null ||
      selectedStep == null
    )
      return

    const index = slidesToRender.findIndex(
      (step) => step.id === selectedStep.id
    )
    if (index < 0) return

    swiper.slideTo(index, 500)
  }, [swiper, selectedStep])

  return steps != null ? (
    <StyledSwiper
      modules={modules}
      breakpoints={swiperBreakpoints}
      onSwiper={setSwiper}
      {...swiperProps}
      sx={{
        ...swiperSx,
        height: swiperHeight
      }}
    >
      {slidesToRender.map((step) => {
        const isSelected = selectedStep?.id === step.id
        const selectedSlideSx =
          variant === 'media' && isSelected
            ? {
                width: {
                  xs: cardWidth.xs * SELECTED_SCALE,
                  sm: cardWidth.sm * SELECTED_SCALE
                },
                height: {
                  xs: cardHeight.xs * SELECTED_SCALE,
                  sm: cardHeight.sm * SELECTED_SCALE
                }
              }
            : {}
        return (
          <StyledSwiperSlide
            data-testid="TemplateCardsSwiperSlide"
            key={step.id}
            sx={{ ...slideSx, ...selectedSlideSx }}
          >
            <TemplateCardPreviewItem
              step={step}
              variant={variant}
              onClick={onClick}
              selectedStep={selectedStep}
            />
          </StyledSwiperSlide>
        )
      })}
      {showMoreCardsSlide && steps.length > slidesToRender.length && (
        <StyledSwiperSlide
          data-testid="UseTemplatesSlide"
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
              width: cardWidth,
              mr: { xs: 3, sm: 7 },
              height: cardHeight,
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
            <Typography
              variant="overline2"
              color="background.paper"
              textAlign="center"
            >
              {t('Use this template to see more!')}
            </Typography>
            <TemplateActionButton signedIn={authUser?.id != null} />
          </Stack>
          <Box
            sx={{
              position: 'relative',
              bottom: { xs: 290, sm: 400 },
              left: 10,
              zIndex: -1,
              minWidth: cardWidth,
              mr: { xs: 3, sm: 7 },
              height: cardHeight,
              borderRadius: 2,
              backgroundColor: 'secondary.light'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: -10, sm: -10 },
              left: 30,
              zIndex: -2,
              minWidth: cardWidth,
              mr: { xs: 3, sm: 7 },
              height: cardHeight,
              borderRadius: 2,
              backgroundColor: 'divider'
            }}
          />
        </StyledSwiperSlide>
      )}
    </StyledSwiper>
  ) : (
    <TemplateCardPreviewPlaceholder
      cardWidth={cardWidth}
      cardHeight={cardHeight}
    />
  )
}
