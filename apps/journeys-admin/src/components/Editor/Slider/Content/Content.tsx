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
        '& .journey-edit-content-component-enter': {
          opacity: 0
        },
        '& .journey-edit-content-component-enter-active': {
          opacity: 1
        },
        '& .journey-edit-content-component-enter-done': {
          opacity: 1
        },
        '& .journey-edit-content-component-exit': {
          opacity: 1
        },
        '& .journey-edit-content-component-exit-active': {
          opacity: 0
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
            transition: (theme) =>
              `${theme.transitions.create('opacity', {
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
