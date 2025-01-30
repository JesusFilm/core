import Box from '@mui/material/Box'
import Slide from '@mui/material/Slide'
import type { ReactElement } from 'react'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveAction } from '@core/journeys/ui/EditorProvider/EditorProvider'

import { Canvas } from './Canvas'
import { Goals } from './Goals'
import { SocialPreview } from './Social'

export function Content(): ReactElement | null {
  const {
    state: { activeContent, activeAction }
  } = useEditor()
  let content: ReactElement | null
  switch (activeContent) {
    case ActiveContent.Social:
      content = <SocialPreview />
      break
    case ActiveContent.Goals:
      content = <Goals />
      break
    default:
      content = <Canvas />
  }

  return (
    <Box
      data-testid="Content"
      sx={{
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      <Slide
        in={activeAction != ActiveAction.Idle}
        direction="left"
        mountOnEnter
      >
        <div>{content}</div>
      </Slide>
    </Box>
  )
}
