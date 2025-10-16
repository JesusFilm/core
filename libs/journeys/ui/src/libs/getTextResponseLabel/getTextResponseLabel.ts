import { TreeBlock } from '../block'

/**
 * Retrieves the label from a TextResponseBlock if the label is not empty, otherwise returns null.
 *
 * @param block - The text response block to extract the label from.
 * @returns The label string (if label is non-empty), otherwise null.
 */

export function getTextResponseLabel(
  block: TreeBlock<{ label: string }>
): string | null {
  return block.label.trim() !== '' ? block.label : null
}
