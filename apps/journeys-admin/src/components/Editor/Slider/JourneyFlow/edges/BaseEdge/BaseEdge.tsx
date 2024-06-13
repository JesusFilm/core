import { alpha, useTheme } from '@mui/material/styles'
import { CSSProperties, ReactElement, ReactNode, useState } from 'react'
import { BaseEdge as DefaultBaseEdge, useOnSelectionChange } from 'reactflow'

import { hasTouchScreen } from '@core/shared/ui/deviceUtils'

import {
  MARKER_END_DEFAULT_COLOR,
  MARKER_END_SELECTED_COLOR
} from '../../libs/transformSteps'

interface BaseEdgeProps {
  id: string
  edgePath: string
  style: CSSProperties
  children: ReactNode
  isSelected?: boolean // for testing only
}

export function BaseEdge({
  id,
  style,
  edgePath,
  children,
  isSelected = false
}: BaseEdgeProps): ReactElement {
  const [edgeSelected, setEdgeSelected] = useState(isSelected)
  const [isHovering, setIsHovering] = useState(false)
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

  const props = !hasTouchScreen() && {
    onMouseOver: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false)
  }

  let stroke: CSSProperties['stroke']

  if (edgeSelected) {
    stroke = theme.palette.primary.main
  } else {
    if (isHovering) {
      stroke = alpha(theme.palette.primary.main, 0.5)
    } else {
      stroke = alpha(theme.palette.secondary.dark, 0.1)
    }
  }

  return (
    <g {...props} data-testid={`BaseEdge-${id}`}>
      <DefaultBaseEdge
        path={edgePath}
        markerEnd={`url(#1__color=${
          edgeSelected ? MARKER_END_SELECTED_COLOR : MARKER_END_DEFAULT_COLOR
        }&height=10&type=arrowclosed&width=10)`}
        style={{
          strokeWidth: 2,
          stroke,
          transition: theme.transitions.create('stroke'),
          ...style
        }}
      />
      {children}
    </g>
  )
}
