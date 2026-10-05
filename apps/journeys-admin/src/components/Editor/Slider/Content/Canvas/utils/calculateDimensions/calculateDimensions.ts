import { RefObject } from 'react'

import { EDIT_TOOLBAR_HEIGHT } from '../../../../../constants'

export const CARD_WIDTH = 324
export const CARD_HEIGHT = 674

// height of the layered editor's floating paper: the card plus vertical chrome
// (slug edit, footer, breathing room). The card/settings paper and the media
// library overlay both use this so they stay vertically aligned.
export const LAYERED_DRAWER_HEIGHT = CARD_HEIGHT + 200

export function calculateScale(ref: RefObject<HTMLDivElement | null>): number {
  const current = ref.current
  if (current == null) return 0

  const clientHeight =
    current.clientHeight / (CARD_HEIGHT + EDIT_TOOLBAR_HEIGHT)
  return Math.min(clientHeight, 1)
}

// chrome that must stay on-screen below the card in the layered editor: the
// "ADD BLOCK" footer (Fab + its top margin) and the gap above it, so the card
// scales down enough to keep the footer visible on shorter screens.
export const LAYERED_CARD_CHROME = 120

// In the layered editor the card sits in a fixed-height floating drawer with the
// footer rendered beneath it. Scale the card against the height that remains
// after reserving that chrome (rather than the full container) so the footer is
// always visible and the card keeps a max size of 1 on tall screens.
export function calculateLayeredScale(
  ref: RefObject<HTMLDivElement | null>
): number {
  const current = ref.current
  if (current == null) return 0

  return Math.min((current.clientHeight - LAYERED_CARD_CHROME) / CARD_HEIGHT, 1)
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
