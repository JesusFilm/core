import { useEditor } from '@core/journeys/ui/EditorProvider'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { Fab } from '../../../../Fab'
import { CardAnalytics } from './CardAnalytics'

interface CanvasFooterProps {
  scale: number
}

export function CanvasFooter({ scale }: CanvasFooterProps): ReactElement {
  const {
    state: { showAnalytics }
  } = useEditor()

  return showAnalytics !== true ? (
    <Box
      sx={{
        mt: 4,
        alignSelf: 'end',
        transform: `scale(${scale})`
      }}
    >
      <Fab variant="canvas" />
    </Box>
  ) : (
    <Box
      sx={{
        mt: 4,
        alignSelf: 'center',
        transform: `scale(${scale})`
      }}
    >
      <CardAnalytics />
    </Box>
  )
}
