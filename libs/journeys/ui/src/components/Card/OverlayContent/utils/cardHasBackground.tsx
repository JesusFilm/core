import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { StepFields } from '../../../Step/__generated__/StepFields'

import { BlockFields_CardBlock as CardBlock } from '../../../../libs/block/__generated__/BlockFields'

//
export function cardHasBackground(): boolean {
  const { blockHistory } = useBlocks()
  const currentStep = blockHistory[blockHistory.length - 1] as
    | TreeBlock<StepFields>
    | undefined

  const currentCard = currentStep?.children[0] as TreeBlock<CardBlock>
  // console.log('Has coverblock = ', currentCard.coverBlockId != null)
  return currentCard?.coverBlockId != null
}
