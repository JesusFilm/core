import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { Fab } from '../../../../Fab'

import { CardAnalytics } from './CardAnalytics'
import { Typography } from '@mui/material'

interface CanvasFooterProps {
  scale: number
}

export function CanvasFooter({ scale }: CanvasFooterProps): ReactElement {
  const {
    state: { showAnalytics, importedSteps }
  } = useEditor()

  return (
    <Box
      data-testid="CanvasFooter"
      sx={{
        mt: 4,
        alignSelf:
          showAnalytics === true || importedSteps != null ? 'unset' : 'end',
        transform: `scale(${scale})`,
        width: '100%'
      }}
    >
      {showAnalytics === true ? (
        <CardAnalytics />
      ) : importedSteps != null ? (
        <Typography sx={{ width: '360px' }}>
          Cards are read-only in import preview mode, confirm import to save and
          edit cards
        </Typography>
      ) : (
        <Fab variant="canvas" />
      )}
    </Box>
  )
}
