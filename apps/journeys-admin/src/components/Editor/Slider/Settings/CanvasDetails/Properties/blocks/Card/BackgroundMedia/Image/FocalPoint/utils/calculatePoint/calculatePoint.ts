import { RefObject } from 'react'

import { MAX_VALUE, Position } from '../../FocalPoint'

export function calculatePoint(
  e: React.MouseEvent | MouseEvent,
  imageRef: RefObject<HTMLDivElement>
): Position | null {
  if (imageRef.current == null) return null
  const boundingRect = imageRef.current.getBoundingClientRect()
  const x = ((e.clientX - boundingRect.left) / boundingRect.width) * MAX_VALUE
  const y = ((e.clientY - boundingRect.top) / boundingRect.height) * MAX_VALUE
  return { x, y }
}
