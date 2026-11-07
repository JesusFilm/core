import { RefObject } from 'react'

import { CanvasOrientation } from '@core/journeys/ui/EditorProvider'

import {
  DRAWER_GAP,
  DRAWER_WIDTH,
  EDIT_TOOLBAR_HEIGHT
} from '../../../../../constants'

export const CARD_WIDTH = 324
export const CARD_HEIGHT = 674

interface CardDimensions {
  width: number
  height: number
}

// Landscape swaps the portrait frame: 674 wide reaches the theme's `sm`
// (Mobile L) breakpoint inside the iframe, so the Card picks up the same
// layout the published journey shows on a phone held sideways.
export function getCardDimensions(
  orientation?: CanvasOrientation
): CardDimensions {
  if (orientation === CanvasOrientation.Landscape)
    return { width: CARD_HEIGHT, height: CARD_WIDTH }
  return { width: CARD_WIDTH, height: CARD_HEIGHT }
}

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

// horizontal space the layered editor takes beside the card: the Properties
// panel with its gaps on either side, plus the card column's own padding
// (px: 5 on each side).
export const LAYERED_CARD_HORIZONTAL_CHROME =
  DRAWER_WIDTH + DRAWER_GAP * 2 + 40 * 2

// In the layered editor the card sits in a fixed-height floating drawer with the
// footer rendered beneath it and the Properties panel beside it. Scale the card
// to whichever runs out first, the height left after reserving the footer
// chrome or the window width left beside Properties, so the footer stays
// visible, a landscape card never overflows narrower windows, and the card
// keeps a max size of 1 on large screens.
export function calculateLayeredScale(
  ref: RefObject<HTMLDivElement | null>,
  orientation?: CanvasOrientation
): number {
  const current = ref.current
  if (current == null) return 0

  const { width, height } = getCardDimensions(orientation)
  const heightScale = (current.clientHeight - LAYERED_CARD_CHROME) / height
  const widthScale =
    (window.innerWidth - LAYERED_CARD_HORIZONTAL_CHROME) / width
  return Math.min(heightScale, widthScale, 1)
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
