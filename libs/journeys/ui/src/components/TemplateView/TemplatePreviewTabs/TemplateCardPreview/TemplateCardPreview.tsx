import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import take from 'lodash/take'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { A11y, FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'
import { NavigationOptions } from 'swiper/types/modules/navigation'

import { TreeBlock } from '../../../../libs/block'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'
import { NavButton } from '../../../ContentCarousel/NavButton'
import { TemplateActionButton } from '../../TemplateViewHeader/TemplateActionButton/TemplateActionButton'

import { TemplateCardPreviewItem } from './TemplateCardPreviewItem/TemplateCardPreviewItem'
import {
  SELECTED_SCALE,
  VARIANT_CONFIGS,
  type TemplateCardPreviewVariant
} from './templateCardPreviewConfig'

interface TemplateCardPreviewProps {
  steps?: Array<TreeBlock<StepBlock>>
  authUser?: User
  variant?: TemplateCardPreviewVariant
  onClick?: (step: TreeBlock<StepBlock>) => void
  selectedStep?: TreeBlock<StepBlock> | null
}

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))
const StyledSwiper = styled(Swiper)(() => ({}))

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
  const [hovered, setHovered] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)

  const config = VARIANT_CONFIGS[variant]
  const {
    cardWidth,
    cardHeight,
    swiperHeight,
    showMoreCardsSlide,
    showNavigation,
    swiperProps,
    slideSx,
    swiperSx
  } = config

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      spaceBetween: 12
    },
    [breakpoints.values.sm]: {
      spaceBetween: variant === 'preview' ? 28 : 12
    }
  }

  const slidesToRender: Array<TreeBlock<StepBlock>> | undefined =
    variant === 'media' ? steps : take(steps, 7)

  useEffect(() => {
    if (swiper != null && showNavigation) {
      const navigation = swiper.params.navigation as NavigationOptions
      navigation.nextEl = nextRef.current
      navigation.prevEl = prevRef.current
      swiper.navigation.destroy()
      swiper.navigation.init()
      swiper.navigation.update()
    }
  }, [swiper, showNavigation])

  const swiperContent = (
    <StyledSwiper
      modules={[Mousewheel, FreeMode, A11y, Navigation]}
      mousewheel={{ forceToAxis: true }}
      freeMode
      watchOverflow
      slidesPerView="auto"
      spaceBetween={12}
      observer
      observeParents
      breakpoints={swiperBreakpoints}
      onSwiper={showNavigation ? setSwiper : undefined}
      {...swiperProps}
      sx={{
        ...swiperSx,
        height: swiperHeight
      }}
    >
      {slidesToRender?.map((step) => {
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
      {showMoreCardsSlide &&
        steps != null &&
        steps.length > (slidesToRender?.length ?? 0) && (
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
                  count: steps.length - (slidesToRender?.length ?? 0)
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
  )

  if (steps == null) {
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

  if (showNavigation) {
    return (
      <Box
        sx={{ position: 'relative' }}
        onMouseOver={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {swiperContent}
        <NavButton
          variant="prev"
          ref={prevRef}
          hovered={hovered}
          disabled={swiper?.isBeginning}
        />
        <NavButton
          variant="next"
          ref={nextRef}
          hovered={hovered}
          disabled={swiper?.isEnd}
        />
      </Box>
    )
  }

  return swiperContent
}
