import { gql, useMutation, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import { darken, styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Zoom from '@mui/material/Zoom'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useEffect, useRef, useState } from 'react'
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react'
import type { SwiperOptions } from 'swiper/types'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import type { getJourneyFlowBackButtonClicked } from '../../../../__generated__/getJourneyFlowBackButtonClicked'
import type { UpdateJourneyFlowBackButtonClicked } from '../../../../__generated__/UpdateJourneyFlowBackButtonClicked'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'

import { Content } from './Content'
import { JourneyFlow } from './JourneyFlow'
import { Settings } from './Settings'

export const UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED = gql`
  mutation UpdateJourneyFlowBackButtonClicked(
    $input: JourneyProfileUpdateInput!
  ) {
    journeyProfileUpdate(input: $input) {
      id
      journeyFlowBackButtonClicked
    }
  }
`

export const GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED = gql`
  query getJourneyFlowBackButtonClicked {
    getJourneyProfile {
      id
      journeyFlowBackButtonClicked
    }
  }
`

const StyledSwiper = styled(Swiper)(() => ({}))
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  boxSizing: 'border-box'
}))

export function Slider(): ReactElement {
  const { breakpoints } = useTheme()
  const swiperRef = useRef<SwiperRef>(null)
  const [showBackButtonHelp, setShowBackButtonHelp] = useState<
    boolean | undefined
  >(undefined)
  const {
    state: { activeSlide, activeContent, selectedStep, showAnalytics },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const [updateBackButtonClick] =
    useMutation<UpdateJourneyFlowBackButtonClicked>(
      UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
      {
        variables: {
          input: {
            journeyFlowBackButtonClicked: true
          }
        }
      }
    )
  useQuery<getJourneyFlowBackButtonClicked>(
    GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
    {
      onCompleted: (data) =>
        setShowBackButtonHelp(
          data?.getJourneyProfile?.journeyFlowBackButtonClicked !== true
        )
    }
  )

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      direction: 'vertical',
      centeredSlides: true,
      centeredSlidesBounds: true
    },
    [breakpoints.values.md]: {
      direction: 'horizontal',
      centeredSlides: false,
      centeredSlidesBounds: false
    }
  }

  useEffect(() => {
    if (
      swiperRef.current != null &&
      swiperRef.current.swiper.activeIndex !== activeSlide
    ) {
      swiperRef.current.swiper.slideTo(activeSlide)
    }
  }, [activeSlide])

  function resetCanvasFocus(): void {
    if (isSlideChangingTo(ActiveSlide.JourneyFlow)) {
      dispatch({
        type: 'SetSelectedBlockOnlyAction',
        selectedBlock: selectedStep
      })
    }
  }

  function isSlideChangingTo(slide): boolean {
    return (
      swiperRef.current != null &&
      swiperRef.current?.swiper.activeIndex === slide
    )
  }

  function handlePrev(): void {
    if (showBackButtonHelp === true) void updateBackButtonClick()

    if (
      activeSlide === ActiveSlide.Content &&
      activeContent === ActiveContent.Goals
    ) {
      dispatch({
        type: 'SetActiveContentAction',
        activeContent:
          selectedStep == null ? ActiveContent.Social : ActiveContent.Canvas
      })
    }
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: activeSlide - 1
    })
  }

  return (
    <StyledSwiper
      data-testid="Slider"
      ref={swiperRef}
      grabCursor
      slidesPerView="auto"
      breakpoints={swiperBreakpoints}
      onActiveIndexChange={(swiper) => {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: swiper.activeIndex
        })
      }}
      onTransitionEnd={resetCanvasFocus}
      sx={{
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`
      }}
    >
      {/* back (mobile top) button */}
      <Box
        slot="container-start"
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 0,
          top: activeSlide === ActiveSlide.Content ? 5 : -75,
          right: 0,
          height: 40,
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: 'flex',
            md: 'none'
          },
          alignItems: 'center',
          justifyContent: 'center',
          transition: (theme) => theme.transitions.create('top')
        }}
      >
        <IconButton
          sx={{
            backgroundColor: 'background.paper',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'background.paper'
            }
          }}
        >
          <ChevronUpIcon data-testid="ChevronUpIcon" />
        </IconButton>
      </Box>
      {/* back (desktop left) button */}
      <Box
        slot="container-start"
        onClick={handlePrev}
        sx={{
          position: 'fixed',
          top: EDIT_TOOLBAR_HEIGHT,
          bottom: 0,
          left: activeSlide > ActiveSlide.JourneyFlow ? 0 : -103,
          width: 103,
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: 'none',
            md: 'flex'
          },
          alignItems: 'center',
          transition: (theme) =>
            theme.transitions.create('left', { duration: 300, delay: 300 })
        }}
      >
        <IconButton
          sx={{
            backgroundColor: 'background.paper',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'divider',
            borderRadius: '41px',
            marginLeft: '30px',
            transition: (theme) => theme.transitions.create('background-color'),
            '&:hover': {
              backgroundColor: (theme) =>
                darken(theme.palette.background.paper, 0.1)
            }
          }}
        >
          <ChevronLeftIcon data-testid="ChevronLeftIcon" />
          <Collapse
            in={
              showBackButtonHelp === true && activeSlide === ActiveSlide.Content
            }
            orientation="horizontal"
            style={{ transitionDelay: '300ms' }}
          >
            <Typography sx={{ color: 'primary.main' }} noWrap>
              {t('back to map')}
            </Typography>
          </Collapse>
        </IconButton>
      </Box>
      <StyledSwiperSlide
        className="swiper-no-swiping"
        sx={{
          p: { xs: 0, md: 4 },
          width: { xs: '100%', md: 'calc(100% - 408px)' },
          height: {
            xs: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 50px)`,
            md: '100%'
          }
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            borderTopLeftRadius: { xs: 0, md: 16 },
            borderTopRightRadius: { xs: 0, md: 16 },
            border: (theme) => ({ md: `1px solid ${theme.palette.divider}` }),
            borderBottom: (theme) => ({
              xs: `1px solid ${theme.palette.divider}`
            }),
            backgroundSize: '20px 20px',
            backgroundColor: '#eff2f5',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <JourneyFlow />
        </Box>
      </StyledSwiperSlide>
      <StyledSwiperSlide
        sx={{
          p: { xs: 0, md: 4 },
          width: { xs: '100%', md: 'calc(100% - 120px - 360px)' },
          height: {
            xs: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 100px)`,
            md: '100%'
          },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: { md: 'space-between' },
          position: 'relative',
          pointerEvents: showAnalytics === true ? 'none' : 'auto'
        }}
      >
        {/* slide bar (mobile bottom) */}
        <Box
          sx={{
            display: {
              xs: 'flex',
              md: 'none'
            },
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px'
          }}
        >
          <Zoom in={activeSlide === ActiveSlide.JourneyFlow}>
            <Box
              sx={{
                width: 56,
                height: 6,
                bgcolor: '#AAACBB',
                borderRadius: '3px'
              }}
            />
          </Zoom>
        </Box>
        <Content />
      </StyledSwiperSlide>
      <StyledSwiperSlide
        sx={{
          p: { xs: 0, md: 4 },
          pb: { md: 0 },
          width: (theme) => ({
            xs: '100%',
            md: DRAWER_WIDTH + Number.parseInt(theme.spacing(8)) // 328 DRAWER_WIDTH + 16px * 2 (padding L & R)
          }),
          height: {
            xs: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 50px)`,
            md: '100%'
          },
          pointerEvents: showAnalytics === true ? 'none' : 'auto'
        }}
      >
        <Settings />
      </StyledSwiperSlide>
    </StyledSwiper>
  )
}
