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
      break
  }

  return (
    <Box
      data-testid="Content"
      sx={{
        position: 'relative',
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'space-between'
      }}
      className="transition-opacity duration-600 ease-in-out"
    >
      <Box
        key={activeContent}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between'
        }}
        className="animate-in fade-in duration-600"
      >
        {content}
      </Box>
    </Box>
  )
}
