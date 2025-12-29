import { RefObject } from 'react'

import { EDIT_TOOLBAR_HEIGHT } from '../../../../../constants'

export const CARD_WIDTH = 324
export const CARD_HEIGHT = 674

export function calculateScale(ref: RefObject<HTMLDivElement | null>): number {
  const current = ref.current
  if (current == null) return 0

  const clientHeight =
    current.clientHeight / (CARD_HEIGHT + EDIT_TOOLBAR_HEIGHT)
  return Math.min(clientHeight, 1)
}

export function calculateScaledMargin(
  dimension: number,
  scale?: number
): string {
  if (scale == null) return '0px'
  return `-${(dimension * (1 - scale)) / 2}px`
}

export function calculateScaledHeight(height: number, scale?: number): string {
  if (scale == null) return `${height}px`
  return `${height * scale}px`
}
