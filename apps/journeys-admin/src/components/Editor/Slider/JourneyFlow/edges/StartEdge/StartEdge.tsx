import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

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
  const theme = useTheme()
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
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: theme.palette.background.paper,
            padding: 4,
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {t('Start')}
          </Typography>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
