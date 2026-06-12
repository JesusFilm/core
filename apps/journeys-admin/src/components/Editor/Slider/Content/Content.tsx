import Box from '@mui/material/Box'
import { type ReactElement, useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'

import { useEditorLayout } from '../../EditorLayoutContext'

import { Canvas } from './Canvas'
import { Goals } from './Goals'
import { SocialPreview } from './Social'

export function Content(): ReactElement {
  const {
    state: { activeContent }
  } = useEditor()
  const { isLayered } = useEditorLayout()
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

  // in the layered desktop view the content sits in the drawer's row layout,
  // so it must contribute intrinsic width (the slider's absolutely-positioned
  // transition wrapper would collapse to zero width here)
  if (isLayered) {
    return (
      <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
        <Box
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
    )
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
        nodeRef={nodeRef}
        key={activeContent}
        timeout={600}
        classNames="journey-edit-content-component"
      >
        <Box
          ref={nodeRef}
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
