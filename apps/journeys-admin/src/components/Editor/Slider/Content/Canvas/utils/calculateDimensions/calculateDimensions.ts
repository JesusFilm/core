import { RefObject } from 'react'

export const CARD_WIDTH = 324
export const CARD_HEIGHT = 702

export function calculateScale(ref: RefObject<HTMLDivElement>): number {
  const current = ref.current
  if (current == null) return 0

  // Initially, the ref's clientWidth returns 0 because no width is specified
  // which is done intentionally for the swiper
  if (current.clientWidth === 0) return 1

  const clientHeight = current.clientHeight / CARD_HEIGHT
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
