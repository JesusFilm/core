import { MockedResponse } from '@apollo/client/testing'
import {
  BlockRestore,
  BlockRestoreVariables,
  BlockRestore_blockRestore_CardBlock as CardBlock,
  BlockRestore_blockRestore_StepBlock as StepBlock
} from '../../../__generated__/BlockRestore'
import { BLOCK_RESTORE } from './useBlockRestoreMutation'

export const stepBlock = {
  typename: 'StepBlock',
  id: 'step',
  journeyId: 'journeyId',
  parentBlockId: null,
  nextBlockId: 'someId'
} as unknown as StepBlock

export const cardBlock = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false
} as CardBlock

export const useBlockRestoreMutationMock: MockedResponse<
  BlockRestore,
  BlockRestoreVariables
> = {
  request: {
    query: BLOCK_RESTORE,
    variables: {
      blockRestoreId: 'blockId'
    }
  },
  result: jest.fn(() => ({
    data: {
      blockRestore: [cardBlock]
    }
  }))
}
