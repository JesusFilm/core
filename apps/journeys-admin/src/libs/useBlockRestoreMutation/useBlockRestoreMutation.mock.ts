import { MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../__generated__/BlockFields'
import {
  BlockRestore,
  BlockRestoreVariables,
  BlockRestore_blockRestore_StepBlock as StepBlockBlockRestore
} from '../../../__generated__/BlockRestore'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'

import { BLOCK_RESTORE } from './useBlockRestoreMutation'

export const stepBlock = {
  __typename: 'StepBlock',
  id: 'step3.id',
  journeyId: 'journey-id',
  parentBlockId: null,
  nextBlockId: 'someId',
  children: []
} as unknown as TreeBlock<StepBlock>

export const stepBlockRes = {
  __typename: 'StepBlock',
  id: 'step3.id',
  journeyId: 'journey-id',
  parentBlockId: null,
  nextBlockId: 'someId',
  children: []
} as unknown as StepBlockBlockRestore

export const cardBlock = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  children: []
} as unknown as TreeBlock<CardBlock>

export const useBlockRestoreMutationMock: MockedResponse<
  BlockRestore,
  BlockRestoreVariables
> = {
  request: {
    query: BLOCK_RESTORE,
    variables: {
      id: 'blockId'
    }
  },
  result: jest.fn(() => ({
    data: {
      blockRestore: [cardBlock]
    }
  }))
}

const selectedBlock: TreeBlock<TypographyBlock> = {
  id: 'typography0.id',
  __typename: 'TypographyBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  content: 'Title',
  variant: TypographyVariant.h1,
  color: TypographyColor.primary,
  align: TypographyAlign.center,
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}
const block1: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography1.id',
  parentOrder: 1
}
const block2: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography2.id',
  parentOrder: 2
}

const selectedStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: 'journey-id',
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: [
    {
      id: 'card1.id',
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
  ]
}

export const restoreStepMock: MockedResponse<
  BlockRestore,
  BlockRestoreVariables
> = {
  request: {
    query: BLOCK_RESTORE,
    variables: {
      id: selectedStep.id
    }
  },
  result: {
    data: {
      blockRestore: [
        {
          ...selectedStep,
          x: 1,
          y: 1
        },
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'stepId',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null
        },
        selectedBlock,
        block1,
        block2
      ]
    }
  }
}
