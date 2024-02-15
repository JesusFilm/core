import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { Canvas } from './Canvas'
import { SocialPreview } from './SocialPreview'
import { ActionsTable } from './Strategy'

export function Content(): ReactElement {
  const {
    state: { journeyEditContentComponent }
  } = useEditor()
  let content: ReactElement
  switch (journeyEditContentComponent) {
    case ActiveJourneyEditContent.SocialPreview:
      content = <SocialPreview />
      break
    case ActiveJourneyEditContent.Action:
      content = <ActionsTable />
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
        key={journeyEditContentComponent}
        timeout={600}
        classNames="journey-edit-content-component"
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
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
