import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

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
        width: showAnalytics === true ? '100%' : 'auto',
        mt: 4,
        transform: `scale(${scale})`,
        transformOrigin: { xs: 'center', md: 'right' }
      }}
    >
      {showAnalytics === true ? <CardAnalytics /> : <Fab variant="canvas" />}
    </Box>
  )
}
