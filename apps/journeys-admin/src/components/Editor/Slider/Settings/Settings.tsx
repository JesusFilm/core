import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'

import { CanvasDetails } from './CanvasDetails'
import { GoalDetails } from './GoalDetails'
import { SocialDetails } from './SocialDetails'

export function Settings(): ReactElement {
  const {
    state: { activeContent }
  } = useEditor()

  let settingsContent: ReactElement | null = null
  switch (activeContent) {
    case ActiveContent.Social:
      settingsContent = <SocialDetails />
      break
    case ActiveContent.Goals:
      settingsContent = <GoalDetails />
      break
    case ActiveContent.Canvas:
      settingsContent = <CanvasDetails />
      break
  }

  return (
    <TransitionGroup
      component={Box}
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        '& .settings-slide-enter': {
          transform: 'translateX(100%)'
        },
        '& .settings-slide-enter-active': {
          transform: 'translateX(0%)',
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: 300,
              easing: theme.transitions.easing.easeOut
            })
        },
        '& .settings-slide-enter-done': {
          transform: 'translateX(0%)'
        },
        '& .settings-slide-exit': {
          transform: 'translateX(0%)'
        },
        '& .settings-slide-exit-active': {
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
        key={activeContent}
        timeout={300}
        classNames="settings-slide"
      >
        <Box
          data-testid="Settings"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            height: '100%',
            overflow: 'auto'
          }}
        >
          {settingsContent}
        </Box>
      </CSSTransition>
    </TransitionGroup>
  )
}
