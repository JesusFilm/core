import { RefObject } from 'react'

import { Position } from '../../FocalPoint'

const MAX_VALUE = 100

export function calculatePoint(
  e: React.MouseEvent | MouseEvent,
  imageRef: RefObject<HTMLDivElement | null>
): Position | null {
  if (imageRef.current == null) return null
  const boundingRect = imageRef.current.getBoundingClientRect()
  const x = ((e.clientX - boundingRect.left) / boundingRect.width) * MAX_VALUE
  const y = ((e.clientY - boundingRect.top) / boundingRect.height) * MAX_VALUE
  return { x, y }
}
