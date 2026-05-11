import { CardFields } from '../../components/Card/__generated__/CardFields'

import type { TreeBlock } from './TreeBlock'

/**
 * Returns the CardBlock child of a step (or any) block, if present.
 * Centralises the `children.find(b => b.__typename === 'CardBlock')` type
 * guard used by Conductor, StepFooter and OverlayContent.
 */
export function getCardChild(
  block?: TreeBlock | null
): TreeBlock<CardFields> | undefined {
  if (block == null || !Array.isArray(block.children)) return undefined
  return block.children.find(
    (child): child is TreeBlock<CardFields> => child.__typename === 'CardBlock'
  )
}
