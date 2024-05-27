import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock } from '../../../../../../../__generated__/BlockFields'

const card: TreeBlock = {
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  coverBlockId: null,
  parentOrder: 0,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: []
}

export const step: TreeBlock<BlockFields_StepBlock> = {
  id: 'stepId',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: [card]
}

export const cachedJourney = {
  'Journey:journeyId': {
    blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
    id: 'journeyId',
    __typename: 'Journey'
  }
}
