import Box from '@mui/material/Box'
import type { ReactElement } from 'react'

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
  }

  return (
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
  )
}
