import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import take from 'lodash/take'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { useJourney } from '../../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../../libs/rtl'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../libs/useJourneyQuery/__generated__/GetJourney'
import { BlockRenderer } from '../../../BlockRenderer'
import { CardWrapper } from '../../../CardWrapper'
import { FramePortal } from '../../../FramePortal'
import { VideoWrapper } from '../../../VideoWrapper'
import { CreateJourneyButton } from '../../CreateJourneyButton'

interface TemplateCardPreviewProps {
  steps?: Array<TreeBlock<StepBlock>>
  authUser?: User
}

interface TemplateCardPreviewItemProps {
  step: TreeBlock<StepBlock>
}

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))
const StyledSwiper = styled(Swiper)(() => ({}))

function TemplateCardPreviewItem({
  step
}: TemplateCardPreviewItemProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: 194, sm: 267 },
        height: { xs: 295, sm: 404 },
        backgroundColor: 'background.default',
        borderRadius: 3
      }}
      data-testid="TemplateCardPreviewItem"
    >
      <Box
        sx={{
          transform: { xs: 'scale(0.4)', sm: 'scale(0.6)' },
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: { xs: 485, sm: 445 },
            height: { xs: 738, sm: 673 },
            zIndex: 2,
            cursor: 'grab'
          }}
        />
        <FramePortal
          sx={{
            width: { xs: 485, sm: 445 },
            height: { xs: 738, sm: 673 }
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
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

export function TemplateCardPreview({
  steps,
  authUser
}: TemplateCardPreviewProps): ReactElement {
  const { breakpoints } = useTheme()
  const { t } = useTranslation('libs-journeys-ui')
  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      spaceBetween: 12
    },
    [breakpoints.values.sm]: {
      spaceBetween: 28
    }
  }

  const slidesToRender: Array<TreeBlock<StepBlock>> | undefined = take(steps, 7)

  return steps != null ? (
    <StyledSwiper
      modules={[Mousewheel, FreeMode, A11y]}
      mousewheel={{
        forceToAxis: true
      }}
      freeMode
      watchOverflow
      slidesPerView="auto"
      spaceBetween={12}
      observer
      observeParents
      breakpoints={swiperBreakpoints}
      sx={{
        overflow: 'visible',
        zIndex: 2,
        height: { xs: 295, sm: 404 }
      }}
    >
      {slidesToRender.map((step) => {
        return (
          <StyledSwiperSlide
            data-testid="TemplateCardsSwiperSlide"
            key={step.id}
            sx={{
              zIndex: 2,
              mr: { xs: 3, sm: 7 },
              width: 'unset !important'
            }}
          >
            <TemplateCardPreviewItem step={step} />
          </StyledSwiperSlide>
        )
      })}
      {steps.length > slidesToRender.length && (
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
              width: { xs: 194, sm: 267 },
              mr: { xs: 3, sm: 7 },
              height: { xs: 295, sm: 404 },
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
            <CreateJourneyButton signedIn={authUser?.id != null} />
          </Stack>
          <Box
            sx={{
              position: 'relative',
              bottom: { xs: 290, sm: 400 },
              left: 10,
              zIndex: -1,
              minWidth: { xs: 194, sm: 267 },
              mr: { xs: 3, sm: 7 },
              height: { xs: 295, sm: 404 },
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
              minWidth: { xs: 194, sm: 267 },
              mr: { xs: 3, sm: 7 },
              height: { xs: 295, sm: 404 },
              borderRadius: 2,
              backgroundColor: 'divider'
            }}
          />
        </StyledSwiperSlide>
      )}
    </StyledSwiper>
  ) : (
    <Stack
      data-testid="TemplateCardsPreviewPlaceholder"
      direction="row"
      sx={{ overflowY: 'visible' }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((value) => {
        return (
          <Skeleton
            variant="rounded"
            key={value}
            data-testid="TemplateCardSkeleton"
            sx={{
              minWidth: { xs: 194, sm: 267 },
              mr: { xs: 3, sm: 7 },
              height: { xs: 295, sm: 404 },
              borderRadius: 2
            }}
          />
        )
      })}
    </Stack>
  )
}
