import { MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockDelete,
  BlockDeleteVariables
} from '../../../../../../../__generated__/BlockDelete'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { BLOCK_DELETE } from '../../../../../../libs/useBlockDeleteMutation'

export const mockNewStepBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'newStep.id',
  parentBlockId: null,
  parentOrder: 1,
  locked: false,
  nextBlockId: null,
  children: [],
  slug: null
}

export const mockNewCardBlock: TreeBlock<CardBlock> = {
  __typename: 'CardBlock',
  id: 'newCard.id',
  parentBlockId: 'newStep.id',
  parentOrder: 0,
  backgroundColor: null,
  coverBlockId: null,
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  fullscreen: false,
  backdropBlur: null,
  children: []
}

export const mockBlockDelete: MockedResponse<
  BlockDelete,
  BlockDeleteVariables
> = {
  request: {
    query: BLOCK_DELETE,
    variables: {
      id: 'newStep.id'
    }
  },
  result: {
    data: {
      blockDelete: []
    }
  }
}
