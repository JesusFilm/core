import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useOnSelectionChange
} from 'reactflow'

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
  const [edgeSelected, setEdgeSelected] = useState(false)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  useOnSelectionChange({
    onChange: (selected) => {
      const selectedEdge = selected.edges.find((edge) => edge.id === id)
      if (selectedEdge != null) {
        setEdgeSelected(true)
      } else {
        setEdgeSelected(false)
      }
    }
  })

  return (
    <>
      <>
        <BaseEdge
          path={edgePath}
          markerEnd={`url(#1__color=${
            edgeSelected ? '#C52D3A' : 'lightGrey'
          }&height=10&type=arrowclosed&width=10)`}
          style={{
            strokeWidth: 2,
            stroke: edgeSelected ? '#C52D3A' : '#0000001A',
            ...style
          }}
        />
        <EdgeLabelRenderer>
          <Box
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: 'white',
              borderRadius: 10,
              border: '1px solid lightGrey'
            }}
          >
            <Typography variant="body2" sx={{ px: 2 }}>
              {t('Start')}
            </Typography>
          </Box>
        </EdgeLabelRenderer>
      </>
    </>
  )
}
