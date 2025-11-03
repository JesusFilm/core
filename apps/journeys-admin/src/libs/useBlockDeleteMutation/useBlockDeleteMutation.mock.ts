import { MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockDelete,
  BlockDeleteVariables
} from '../../../__generated__/BlockDelete'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'

import { BLOCK_DELETE } from './useBlockDeleteMutation'

export const selectedBlock: TreeBlock<TypographyBlock> = {
  id: 'typography0.id',
  __typename: 'TypographyBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  content: 'How did you discover our website today?',
  variant: TypographyVariant.h1,
  color: TypographyColor.primary,
  align: TypographyAlign.center,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  },
  children: []
}
export const block1: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography1.id',
  parentOrder: 1
}
export const block2: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography2.id',
  parentOrder: 2
}

export const selectedStepCardBlock: TreeBlock<CardBlock> = {
  id: 'blockId',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  children: [selectedBlock, block1, block2]
}

export const selectedStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: 'journey-id',
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: [selectedStepCardBlock]
}

export const deleteBlockMock: MockedResponse<
  BlockDelete,
  BlockDeleteVariables
> = {
  request: {
    query: BLOCK_DELETE,
    variables: {
      id: 'typography0.id'
    }
  },
  result: {
    data: {
      blockDelete: [
        {
          __typename: 'TypographyBlock',
          id: 'block1.id',
          parentOrder: 0
        }
      ]
    }
  }
}

export const deleteCardBlockMock: MockedResponse<
  BlockDelete,
  BlockDeleteVariables
> = {
  request: {
    query: BLOCK_DELETE,
    variables: {
      id: selectedStepCardBlock.id
    }
  },
  result: {
    data: {
      blockDelete: [
        {
          __typename: selectedStepCardBlock.__typename,
          id: selectedStepCardBlock.id,
          parentOrder: selectedStepCardBlock.parentOrder
        }
      ]
    }
  }
}

export const deleteStepMock: MockedResponse<BlockDelete, BlockDeleteVariables> =
  {
    request: {
      query: BLOCK_DELETE,
      variables: {
        id: selectedStep.id
      }
    },
    result: {
      data: {
        blockDelete: [
          {
            __typename: 'StepBlock',
            id: selectedStep.id,
            parentOrder: selectedStep.parentOrder,
            nextBlockId: null
          }
        ]
      }
    }
  }
