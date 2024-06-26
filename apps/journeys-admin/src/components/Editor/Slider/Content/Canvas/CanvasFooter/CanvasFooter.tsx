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

  return (
    <Box
      data-testid="CanvasFooter"
      sx={{
        mt: 4,
        alignSelf: showAnalytics ? 'center' : 'end',
        transform: `scale(${scale})`
      }}
    >
      {showAnalytics ? <CardAnalytics /> : <Fab variant="canvas" />}
    </Box>
  )
}
