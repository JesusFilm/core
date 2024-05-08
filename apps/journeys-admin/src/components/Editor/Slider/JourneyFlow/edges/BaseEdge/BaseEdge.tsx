import { CSSProperties, ReactElement, ReactNode, useState } from 'react'
import { BaseEdge as DefaultBaseEdge, useOnSelectionChange } from 'reactflow'

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
          edgeSelected ? '#C52D3A' : 'lightGrey'
        }&height=10&type=arrowclosed&width=10)`}
        style={{
          strokeWidth: 2,
          stroke: edgeSelected ? '#C52D3A' : '#0000001A',
          ...style
        }}
      />
      {children}
    </>
  )
}
