import {
  BaseEdge as DefaultBaseEdge,
  useOnSelectionChange
} from '@xyflow/react'
import { ReactElement, ReactNode } from 'react'

interface BaseEdgeProps {
  id: string
  path: string
  style?: Record<string, unknown>
  children?: ReactNode
}

export function BaseEdge({
  id,
  path,
  style = {},
  children
}: BaseEdgeProps): ReactElement {
  useOnSelectionChange({
    onChange: ({ edges }) => {
      const isSelected = edges.some((edge) => edge.id === id)
      const element = document.querySelector(`[data-testid="BaseEdge-${id}"]`)
      if (element != null) {
        if (isSelected) {
          element.classList.add('selected')
        } else {
          element.classList.remove('selected')
        }
      }
    }
  })

  return (
    <>
      <DefaultBaseEdge
        id={id}
        path={path}
        style={style}
        data-testid={`BaseEdge-${id}`}
      />
      {children}
    </>
  )
}
