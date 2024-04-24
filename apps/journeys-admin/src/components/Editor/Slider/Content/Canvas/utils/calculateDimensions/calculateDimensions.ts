import { RefObject } from 'react'

export const CARD_WIDTH = 375
export const CARD_HEIGHT = 670

export function calculateScale(
  ref: RefObject<HTMLDivElement>
): number | undefined {
  const current = ref.current
  if (current == null) return

  const clientWidth = current.clientWidth / CARD_WIDTH
  const clientHeight = current.clientHeight / CARD_HEIGHT
  const scale = Math.min(clientWidth, clientHeight)

  return scale === 0 ? 1 : Math.min(scale, 1)
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
