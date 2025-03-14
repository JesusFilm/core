import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Content } from '../Slider/Content'
import { JourneyFlow } from '../Slider/JourneyFlow'
import { Settings } from '../Slider/Settings'

interface SinglePageEditorProps {
  flowType: 'mobile' | 'desktop'
}

export function SinglePageEditor({
  flowType
}: SinglePageEditorProps): ReactElement {
  const {
    state: { activeContent, activeSlide }
  } = useEditor()

  const showSettings = activeSlide === ActiveSlide.Content
  const contentWidth =
    activeContent === ActiveContent.Canvas ? '370px' : '900px'

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
        <JourneyFlow flowType={flowType} />
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
                minWidth: contentWidth,
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
