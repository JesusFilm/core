import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import take from 'lodash/take'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { AuthUser as User } from '../../../../libs/auth/types'
import { TreeBlock } from '../../../../libs/block'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'
import { TemplateActionButton } from '../../TemplateViewHeader/TemplateActionButton/TemplateActionButton'

import {
  type BreakpointSwiperOptions,
  SELECTED_SCALE,
  type TemplateCardPreviewVariant,
  VARIANT_CONFIGS
} from './templateCardPreviewConfig'
import { TemplateCardPreviewItem } from './TemplateCardPreviewItem'

const CARD_LABEL_HEIGHT = 54

interface TemplateCardPreviewProps {
  steps?: Array<TreeBlock<StepBlock>>
  authUser?: User | null
  variant?: TemplateCardPreviewVariant
  onClick?: (step: TreeBlock<StepBlock>) => void
  selectedStep?: TreeBlock<StepBlock> | null
  initialStepId?: string | null
  cardLabel?: string
}

interface TemplateCardPreviewPlaceholderProps {
  cardWidth: { xs: number; sm: number }
  cardHeight: { xs: number; sm: number }
  breakpoints: { xs: BreakpointSwiperOptions; sm: BreakpointSwiperOptions }
}

function TemplateCardPreviewPlaceholder({
  cardWidth,
  cardHeight,
  breakpoints: bp
}: TemplateCardPreviewPlaceholderProps) {
  return (
    <Stack
      data-testid="TemplateCardsPreviewPlaceholder"
      direction="row"
      sx={{
        pl: {
          xs: `${bp.xs.slidesOffsetBefore ?? 0}px`,
          sm: `${bp.sm.slidesOffsetBefore ?? 0}px`
        }
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((value) => (
        <Skeleton
          variant="rounded"
          key={value}
          data-testid="TemplateCardSkeleton"
          sx={{
            minWidth: cardWidth,
            mr: {
              xs: `${bp.xs.spaceBetween ?? 0}px`,
              sm: `${bp.sm.spaceBetween ?? 0}px`
            },
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

function getSpacerWidth(
  cardWidth: number,
  bp: BreakpointSwiperOptions
): string {
  const selectedWidth = cardWidth * SELECTED_SCALE
  const space = bp.spaceBetween ?? 0
  const offset = bp.slidesOffsetBefore ?? 0
  return `calc(100% - ${selectedWidth}px - ${space}px - ${offset}px)`
}

/**
 * Horizontal carousel of template step cards with optional "more cards" slide.
 *
 * TemplateCardPreview has three variants:
 *
 * 'standard': Renders the first 7 steps plus a "use this template" call-to-action. Used on the /templates page.
 *
 * 'compact': Renders the full list of customizable media steps with selection state. Used in the template customization flow.
 *
 * 'guestPreview': Full-size responsive preview used in the guest preview dialog.
 *
 * @param props - Component props
 * @param props.steps - Journey step blocks to display as cards
 * @param props.authUser - Authenticated user for CTA sign-in state
 * @param props.variant - Controls layout and behaviour
 * @param props.onClick - Handler when a card is clicked
 * @param props.selectedStep - Selected step (compact variant)
 * @returns Carousel UI or skeleton placeholder when steps are loading
 */
export function TemplateCardPreview({
  steps,
  authUser,
  variant = 'standard',
  onClick,
  selectedStep,
  initialStepId,
  cardLabel
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
    modules,
    breakpoints: variantBreakpoints
  } = config

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: variantBreakpoints.xs,
    [breakpoints.values.sm]: variantBreakpoints.sm
  }

  const slidesToRender =
    steps != null
      ? config.maxSlides != null
        ? take(steps, config.maxSlides)
        : steps
      : []

  const initialSlide =
    initialStepId != null && slidesToRender.length > 0
      ? Math.max(
          0,
          slidesToRender.findIndex((s) => s.id === initialStepId)
        )
      : 0

  useEffect(() => {
    if (variant !== 'compact' || swiper == null || selectedStep == null) return

    const index = slidesToRender.findIndex(
      (step) => step.id === selectedStep.id
    )
    if (index < 0) return

    swiper.update()
    swiper.slideTo(index, 500)
  }, [swiper, selectedStep])

  if (steps == null) {
    return (
      <TemplateCardPreviewPlaceholder
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        breakpoints={variantBreakpoints}
      />
    )
  }

  return (
    <StyledSwiper
      modules={modules}
      breakpoints={swiperBreakpoints}
      onSwiper={setSwiper}
      initialSlide={initialStepId != null ? initialSlide : undefined}
      {...swiperProps}
      sx={{
        ...swiperSx,
        height:
          cardLabel != null
            ? {
                xs: swiperHeight.xs + CARD_LABEL_HEIGHT,
                sm: swiperHeight.sm + CARD_LABEL_HEIGHT
              }
            : swiperHeight
      }}
    >
      {slidesToRender.map((step) => {
        const isSelected =
          config.selectedBoxShadow != null && selectedStep?.id === step.id
        const selectedSlideStyles = isSelected
          ? {
              width: {
                xs: cardWidth.xs * SELECTED_SCALE,
                sm: cardWidth.sm * SELECTED_SCALE
              },
              height: {
                xs:
                  cardHeight.xs * SELECTED_SCALE +
                  (cardLabel != null ? CARD_LABEL_HEIGHT : 0),
                sm:
                  cardHeight.sm * SELECTED_SCALE +
                  (cardLabel != null ? CARD_LABEL_HEIGHT : 0)
              },
              zIndex: 1
            }
          : {}
        return (
          <StyledSwiperSlide
            data-testid="TemplateCardsSwiperSlide"
            key={step.id}
            sx={{ ...slideSx, ...selectedSlideStyles }}
          >
            <TemplateCardPreviewItem
              step={step}
              variant={variant}
              onClick={onClick}
              selectedStep={selectedStep}
              steps={slidesToRender}
            />
            {isSelected && cardLabel != null && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  animation: 'fadeSlideDown 0.3s ease 0.15s forwards',
                  opacity: 0,
                  '@keyframes fadeSlideDown': {
                    from: {
                      opacity: 0,
                      transform: 'translateX(-50%) translateY(-12px)'
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateX(-50%) translateY(0)'
                    }
                  }
                }}
              >
                {cardLabel}
              </Typography>
            )}
          </StyledSwiperSlide>
        )
      })}
      {variant === 'compact' && (
        <StyledSwiperSlide
          data-testid="MediaSpacerSlide"
          sx={{
            width: {
              xs: getSpacerWidth(cardWidth.xs, variantBreakpoints.xs),
              sm: getSpacerWidth(cardWidth.sm, variantBreakpoints.sm)
            }
          }}
        />
      )}
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
            <TemplateActionButton signedIn={authUser?.email != null} />
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
  )
}
