import { useMutation, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { darken } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { getJourneyFlowBackButtonClicked } from '../../../../__generated__/getJourneyFlowBackButtonClicked'
import { UpdateJourneyFlowBackButtonClicked } from '../../../../__generated__/UpdateJourneyFlowBackButtonClicked'
import {
  ACTIVE_CONTENT_WIDTH,
  BACK_BUTTON_HELP_TEXT_WIDTH,
  BACK_BUTTON_RADIUS,
  DRAWER_WIDTH,
  EDIT_TOOLBAR_HEIGHT
} from '../constants'
import { Content } from '../Slider/Content'
import { JourneyFlow } from '../Slider/JourneyFlow'
import { Settings } from '../Slider/Settings'
import {
  GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
  UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED
} from '../Slider/Slider'

export function SinglePageEditor(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { activeContent, activeSlide, selectedStep, steps },
    dispatch
  } = useEditor()
  const [showCollapseText, setShowCollapseText] = useState(false)
  const { data } = useQuery<getJourneyFlowBackButtonClicked>(
    GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED
  )
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

  // Collapses in help text after animation)
  useEffect(() => {
    if (activeSlide !== ActiveSlide.JourneyFlow) {
      const timer = setTimeout(() => {
        setShowCollapseText(true)
      }, 700)
      return () => clearTimeout(timer)
    } else {
      setShowCollapseText(false)
    }
  }, [activeSlide])

  const showBackButtonHelp =
    data?.getJourneyProfile?.journeyFlowBackButtonClicked !== true

  function handleBack(): void {
    if (showBackButtonHelp === true) void updateBackButtonClick()

    if (
      activeSlide === ActiveSlide.Content &&
      activeContent !== ActiveContent.Canvas &&
      steps != null
    ) {
      const step = selectedStep ?? steps[0]
      dispatch({
        type: 'SetEditorFocusAction',
        selectedStep: step,
        activeContent: ActiveContent.Canvas
      })
    }
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: activeSlide - 1
    })
  }

  const textWidth = showBackButtonHelp ? BACK_BUTTON_HELP_TEXT_WIDTH : 0
  const backButtonPosition =
    DRAWER_WIDTH +
    ACTIVE_CONTENT_WIDTH[activeContent] -
    BACK_BUTTON_RADIUS +
    textWidth

  const showSettings = activeSlide === ActiveSlide.Content

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        overflow: 'hidden',
        p: 4,
        position: 'relative'
      }}
    >
      {/* back button */}
      <Box
        slot="container-end"
        onClick={handleBack}
        sx={{
          position: 'fixed',
          top: EDIT_TOOLBAR_HEIGHT,
          bottom: 0,
          right: backButtonPosition,
          width: 103,
          zIndex: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          opacity: 0,
          animation:
            activeSlide !== ActiveSlide.JourneyFlow
              ? (theme) =>
                  `fadeIn 300ms ${theme.transitions.easing.easeInOut} 400ms forwards`
              : 'none',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 }
          },
          visibility:
            activeSlide === ActiveSlide.JourneyFlow ? 'hidden' : 'visible'
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
            opacity: 'inherit',
            transition: (theme) => theme.transitions.create('background-color'),
            '&:hover': {
              backgroundColor: (theme) =>
                darken(theme.palette.background.paper, 0.1)
            }
          }}
        >
          <Collapse
            in={showBackButtonHelp && showCollapseText}
            orientation="horizontal"
            timeout={300}
          >
            <Typography
              sx={{
                color: 'primary.main',
                pl: 1
              }}
              noWrap
            >
              {t('Close details')}
            </Typography>
          </Collapse>
          <ChevronRightIcon data-testid="ChevronRightIcon" />
        </IconButton>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          mr: 2,
          borderRadius: 4,
          overflow: 'hidden',
          height: '100%',
          width: '100%',
          transition: (theme) =>
            theme.transitions.create('width', {
              duration: 300,
              easing: theme.transitions.easing.easeInOut
            })
        }}
      >
        <JourneyFlow flowType="desktop" />
      </Box>

      <TransitionGroup
        component={Box}
        sx={{
          display: 'flex',
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: 300,
              easing: theme.transitions.easing.easeInOut
            }),
          '& .content-wrapper-enter': {
            transform: 'translateX(100%)'
          },
          '& .content-wrapper-enter-active': {
            transform: 'translateX(0)',
            transition: (theme) =>
              theme.transitions.create('transform', {
                duration: 300,
                easing: theme.transitions.easing.easeOut
              })
          },
          '& .content-wrapper-exit': {
            transform: 'translateX(0)'
          },
          '& .content-wrapper-exit-active': {
            transform: 'translateX(100%)',
            transition: (theme) =>
              theme.transitions.create('transform', {
                duration: 300,
                easing: theme.transitions.easing.easeIn
              })
          }
        }}
      >
        <CSSTransition
          in={activeSlide !== ActiveSlide.JourneyFlow}
          timeout={300}
          classNames="content-wrapper"
          unmountOnExit
        >
          <Stack direction="row">
            <Box
              sx={{
                minWidth: ACTIVE_CONTENT_WIDTH[activeContent],
                pt: 2,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Content />
            </Box>

            <Box
              sx={{
                width: showSettings ? `${DRAWER_WIDTH}px` : '0px',
                overflow: 'hidden',
                maxHeight: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 32px)`,
                transition: (theme) =>
                  theme.transitions.create('width', {
                    duration: 300,
                    easing: theme.transitions.easing.easeInOut
                  })
              }}
            >
              {showSettings && <Settings />}
            </Box>
          </Stack>
        </CSSTransition>
      </TransitionGroup>
    </Stack>
  )
}
