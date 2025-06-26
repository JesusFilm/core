import { RefObject } from 'react'

import { EDIT_TOOLBAR_HEIGHT } from '../../../../../constants'

export const CARD_WIDTH = 324
export const CARD_HEIGHT = 674

export function calculateScale(ref: RefObject<HTMLDivElement>): number {
  const current = ref.current
  if (current == null) return 1 // Return 1 instead of 0 as fallback

  const clientHeight = current.clientHeight
  if (clientHeight === 0) return 1 // Return 1 if no height available yet

  const scale = clientHeight / (CARD_HEIGHT + EDIT_TOOLBAR_HEIGHT)
  return Math.min(scale, 1)
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
