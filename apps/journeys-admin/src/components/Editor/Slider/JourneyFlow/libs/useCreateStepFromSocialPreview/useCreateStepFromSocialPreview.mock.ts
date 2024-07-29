import { MockedResponse } from '@apollo/client/testing'
import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockDelete,
  BlockDeleteVariables
} from '../../../../../../../__generated__/BlockDelete'
import {
  BlockDeleteWithBlockOrderUpdate,
  BlockDeleteWithBlockOrderUpdateVariables
} from '../../../../../../../__generated__/BlockDeleteWithBlockOrderUpdate'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  BlockRestoreWithBlockOrderUpdate,
  BlockRestoreWithBlockOrderUpdateVariables
} from '../../../../../../../__generated__/BlockRestoreWithBlockOrderUpdate'
import {
  StepAndCardBlockCreateWithBlockOrderUpdate,
  StepAndCardBlockCreateWithBlockOrderUpdateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreateWithBlockOrderUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { BLOCK_DELETE } from '../../../../../../libs/useBlockDeleteMutation'
import {
  BLOCK_DELETE_WITH_BLOCK_ORDER_UPDATE,
  BLOCK_RESTORE_WITH_BLOCK_ORDER_UPDATE,
  STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ORDER_UPDATE
} from './useCreateStepFromSocialPreview'

export const mockNewStepBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'newStep.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: []
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
  children: []
}

export const mockStepAndCardBlockCreateWithBlockOrderUpdate: MockedResponse<
  StepAndCardBlockCreateWithBlockOrderUpdate,
  StepAndCardBlockCreateWithBlockOrderUpdateVariables
> = {
  request: {
    query: STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ORDER_UPDATE,
    variables: {
      stepBlockCreateInput: {
        id: 'newStep.id',
        journeyId: 'journey-id',
        x: 777,
        y: 777
      },
      cardBlockCreateInput: {
        id: 'newCard.id',
        journeyId: 'journey-id',
        parentBlockId: 'newStep.id',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      },
      stepId: 'newStep.id',
      parentOrder: 0
    }
  },
  result: {
    data: {
      stepBlockCreate: { ...mockNewStepBlock, x: 777, y: 777 },
      cardBlockCreate: mockNewCardBlock,
      blockOrderUpdate: [mockNewStepBlock]
    }
  }
}

export const mockBlockDeleteWithBlockOrderUpdate: MockedResponse<
  BlockDeleteWithBlockOrderUpdate,
  BlockDeleteWithBlockOrderUpdateVariables
> = {
  request: {
    query: BLOCK_DELETE_WITH_BLOCK_ORDER_UPDATE,
    variables: {
      id: 'newStep.id',
      journeyId: 'journey-id',
      stepId: 'newStep.id',
      parentOrder: 0
    }
  },
  result: {
    data: {
      blockDelete: [mockNewStepBlock],
      blockOrderUpdate: [mockNewStepBlock]
    }
  }
}

export const deleteStepMock: MockedResponse<BlockDelete, BlockDeleteVariables> =
  {
    request: {
      query: BLOCK_DELETE,
      variables: {
        id: mockNewStepBlock.id,
        parentBlockId: mockNewStepBlock.parentBlockId,
        journeyId: 'journey-id'
      }
    },
    result: {
      data: {
        blockDelete: [
          {
            __typename: 'StepBlock',
            id: mockNewStepBlock.id,
            parentOrder: mockNewStepBlock.parentOrder,
            nextBlockId: null
          }
        ]
      }
    }
  }

export const mockBlockRestoreWithBlockOrderUpdate: MockedResponse<
  BlockRestoreWithBlockOrderUpdate,
  BlockRestoreWithBlockOrderUpdateVariables
> = {
  request: {
    query: BLOCK_RESTORE_WITH_BLOCK_ORDER_UPDATE,
    variables: { id: 'newStep.id', stepId: 'newStep.id', parentOrder: 0 }
  },
  result: {
    data: {
      blockRestore: [{ ...mockNewStepBlock, x: 777, y: 777 }, mockNewCardBlock],
      blockOrderUpdate: [mockNewStepBlock]
    }
  }
}
