import Box from '@mui/material/Box'
import type { ReactElement } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'

import { Canvas } from './Canvas'
import { Goals } from './Goals'
import { SocialPreview } from './Social'

export function Content(): ReactElement {
  const {
    state: { activeContent }
  } = useEditor()
  let content: ReactElement
  switch (activeContent) {
    case ActiveContent.Social:
      content = <SocialPreview />
      break
    case ActiveContent.Goals:
      content = <Goals />
      break
    default:
      content = <Canvas />
      break
  }

  return (
    <TransitionGroup
      component={Box}
      sx={{
        position: 'relative',
        flexGrow: 1,
        height: '100%',
        '& .journey-edit-content-component-enter': {
          opacity: 0,
          transform: 'translateX(50px)'
        },
        '& .journey-edit-content-component-enter-active': {
          opacity: 1,
          transform: 'translateX(0)',
          transition: (theme) =>
            `${theme.transitions.create(['opacity', 'transform'], {
              duration: 300,
              easing: theme.transitions.easing.easeOut
            })}`
        },
        '& .journey-edit-content-component-enter-done': {
          opacity: 1,
          transform: 'translateX(0)'
        },
        '& .journey-edit-content-component-exit': {
          opacity: 1,
          transform: 'translateX(0)'
        },
        '& .journey-edit-content-component-exit-active': {
          opacity: 0,
          transform: 'translateX(50px)',
          transition: (theme) =>
            `${theme.transitions.create(['opacity', 'transform'], {
              duration: 300,
              easing: theme.transitions.easing.easeIn
            })}`
        }
      }}
    >
      <CSSTransition
        key={activeContent}
        timeout={600}
        classNames="journey-edit-content-component"
      >
        <Box
          data-testid="Content"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            height: '100%',
            transition: (theme) =>
              `${theme.transitions.create(['opacity', 'transform'], {
                duration: 300
              })}`
          }}
        >
          {content}
        </Box>
      </CSSTransition>
    </TransitionGroup>
  )
}
