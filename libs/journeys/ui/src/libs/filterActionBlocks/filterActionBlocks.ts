import { TreeBlock } from '../block'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../block/__generated__/BlockFields'
import { ActionBlock, isActionBlock } from '../isActionBlock'

export function filterActionBlocks(step?: TreeBlock<StepBlock>): ActionBlock[] {
  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  if (card == null) return []

  return card.children
    .flatMap((block) =>
      block.__typename === 'RadioQuestionBlock' ? block.children : block
    )
    .filter(
      (child) => card.coverBlockId !== child.id && isActionBlock(child)
    ) as ActionBlock[]
}
