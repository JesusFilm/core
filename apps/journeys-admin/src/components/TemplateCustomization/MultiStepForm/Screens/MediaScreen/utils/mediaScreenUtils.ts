import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'

/**
 * Returns whether the given block or any of its descendants has an id in the provided list.
 *
 * @param block - The tree block to check (and its children recursively).
 * @param ids - List of block ids to match against.
 * @returns True if block.id or any descendant id is in ids, otherwise false.
 */
function hasMatchingDescendant(block: TreeBlock, ids: string[]): boolean {
  if (ids.includes(block.id)) return true
  return block.children.some((child) => hasMatchingDescendant(child, ids))
}

/**
 * Returns the id of the CardBlock of the step.
 *
 * @param step - Step block
 * @returns The card block id
 */
export function getCardBlockIdFromStep(step: TreeBlock<StepBlock>): string {
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>
  return cardBlock.id
}

/**
 * Filters step blocks to only those that contain at least one block whose id is in customizableMediaIds
 * (the block may be the step's direct child or a descendant).
 *
 * @param steps - Array of step blocks from the journey.
 * @param customizableMediaIds - Block ids that represent customizable media.
 * @returns Steps that have at least one matching customizable media block in their subtree.
 */
export function getCustomizableMediaSteps(
  steps: TreeBlock<StepBlock>[],
  customizableMediaIds: string[]
): TreeBlock<StepBlock>[] {
  return steps.filter((step) =>
    step.children.some((child) =>
      hasMatchingDescendant(child, customizableMediaIds)
    )
  )
}
