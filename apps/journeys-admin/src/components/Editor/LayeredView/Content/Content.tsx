import Box from '@mui/material/Box'
import { type ReactElement, useRef } from 'react'
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
  const nodeRef = useRef(null)
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
    // <TransitionGroup
    //   component={Box}
    //   sx={{
    //     width: '100%',
    //     height: '100%',
    //     position: 'relative',
    //     '& .journey-edit-content-component-enter': {
    //       opacity: 0
    //     },
    //     '& .journey-edit-content-component-enter-active': {
    //       opacity: 1
    //     },
    //     '& .journey-edit-content-component-enter-done': {
    //       opacity: 1
    //     },
    //     '& .journey-edit-content-component-exit': {
    //       opacity: 1
    //     },
    //     '& .journey-edit-content-component-exit-active': {
    //       opacity: 0
    //     }
    //   }}
    // >
    // <CSSTransition
    //   nodeRef={nodeRef}
    //   key={activeContent}
    //   timeout={600}
    //   classNames="journey-edit-content-component"
    // >
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      <Box
        ref={nodeRef}
        data-testid="Content"
        sx={{
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          height: '100%'
        }}
      >
        {content}
      </Box>
    </Box>
    // </CSSTransition>
    // </TransitionGroup>
  )
}
