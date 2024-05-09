import { useTheme } from '@mui/material/styles'
import { CSSProperties, ReactElement, ReactNode, useState } from 'react'
import { BaseEdge as DefaultBaseEdge, useOnSelectionChange } from 'reactflow'

import {
  MARKER_END_DEFAULT_COLOR,
  MARKER_END_SELECTED_COLOR
} from '../../nodes/StepBlockNode/libs/colors'

interface BaseEdgeProps {
  id: string
  edgePath: string
  style: CSSProperties
  children: ReactNode
}

export function BaseEdge({
  id,
  style,
  edgePath,
  children
}: BaseEdgeProps): ReactElement {
  const [edgeSelected, setEdgeSelected] = useState(false)
  const theme = useTheme()

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
      <DefaultBaseEdge
        path={edgePath}
        markerEnd={`url(#1__color=${
          edgeSelected ? MARKER_END_SELECTED_COLOR : MARKER_END_DEFAULT_COLOR
        }&height=10&type=arrowclosed&width=10)`}
        style={{
          strokeWidth: 2,
          stroke: edgeSelected
            ? theme.palette.primary.main
            : `${theme.palette.secondary.dark}1A`,
          ...style
        }}
      />
      {children}
    </>
  )
}
