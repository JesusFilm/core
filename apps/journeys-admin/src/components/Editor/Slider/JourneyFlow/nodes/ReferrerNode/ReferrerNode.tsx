import { Box, Typography } from '@mui/material'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BaseNode } from '../BaseNode'

export function ReferrerNode({ id, data, ...rest }) {
  const {
    state: { showJourneyFlowAnalytics }
  } = useEditor()
  return (
    <BaseNode
      id="referrer"
      sourceHandle={showJourneyFlowAnalytics ? 'show' : 'hide'}
      isSourceConnected
    >
      <Box
        sx={{
          borderRadius: 50,
          backgroundColor: 'background.paper',
          px: 3,
          py: 1,
          display: 'flex',
          gap: 6,
          filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.1))',
          opacity: showJourneyFlowAnalytics ? 1 : 0,
          transition: 'opacity 200ms ease-in-out'
        }}
      >
        <Typography variant="body2">{data.property}</Typography>
        <Typography variant="body2">{data.visitors}</Typography>
      </Box>
    </BaseNode>
  )
}
