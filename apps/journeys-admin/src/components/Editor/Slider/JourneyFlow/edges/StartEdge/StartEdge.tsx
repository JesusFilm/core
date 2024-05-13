import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow'

import { BaseEdge } from '../BaseEdge'

export function StartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {}
}: EdgeProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  return (
    <BaseEdge id={id} style={style} edgePath={edgePath}>
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            backgroundColor: 'background.paper',
            borderRadius: 10,
            border: (theme) => `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="body2" sx={{ px: 2 }}>
            {t('Start')}
          </Typography>
        </Box>
      </EdgeLabelRenderer>
    </BaseEdge>
  )
}
