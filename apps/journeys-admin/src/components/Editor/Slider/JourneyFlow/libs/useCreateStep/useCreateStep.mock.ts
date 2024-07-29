import { MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockDeleteWithStepUpdate,
  BlockDeleteWithStepUpdateVariables
} from '../../../../../../../__generated__/BlockDeleteWithStepUpdate'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  BlockRestoreWithStepUpdate,
  BlockRestoreWithStepUpdateVariables
} from '../../../../../../../__generated__/BlockRestoreWithStepUpdate'
import {
  StepAndCardBlockCreateWithStepUpdate,
  StepAndCardBlockCreateWithStepUpdateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreateWithStepUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  BLOCK_DELETE_WITH_STEP_UPDATE,
  BLOCK_RESTORE_WITH_STEP_UPDATE,
  STEP_AND_CARD_BLOCK_CREATE_WITH_STEP_UPDATE
} from './useCreateStep'

export const mockStepBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'originStepBlock.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: []
}

export const mockNewStepBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'newStep.id',
  parentBlockId: null,
  parentOrder: 1,
  locked: false,
  nextBlockId: null,
  children: []
}

export const stepAndCardBlockCreateWithStepUpdateMock: MockedResponse<
  StepAndCardBlockCreateWithStepUpdate,
  StepAndCardBlockCreateWithStepUpdateVariables
> = {
  request: {
    query: STEP_AND_CARD_BLOCK_CREATE_WITH_STEP_UPDATE,
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
      stepId: 'originStepBlock.id',
      journeyId: 'journey-id',
      stepBlockUpdateInput: { nextBlockId: 'newStep.id' }
    }
  },
  result: {
    data: {
      stepBlockCreate: {
        __typename: 'StepBlock',
        id: 'newStep.id',
        parentBlockId: null,
        parentOrder: null,
        locked: false,
        nextBlockId: null,
        x: 777,
        y: 777
      },
      cardBlockCreate: {
        __typename: 'CardBlock',
        id: 'newCard.id',
        parentBlockId: 'newStep.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        fullscreen: false
      },
      stepBlockUpdate: {
        id: 'originStepBlock.id',
        __typename: 'StepBlock',
        nextBlockId: 'newCard.id'
      }
    }
  }
}

export const blockDeleteWithStepUpdate: MockedResponse<
  BlockDeleteWithStepUpdate,
  BlockDeleteWithStepUpdateVariables
> = {
  request: {
    query: BLOCK_DELETE_WITH_STEP_UPDATE,
    variables: {
      id: 'newStep.id',
      journeyId: 'journey-id',
      stepBlockUpdateId: 'originStepBlock.id',
      input: { nextBlockId: null }
    }
  },
  result: {
    data: {
      blockDelete: [mockNewStepBlock],
      stepBlockUpdate: {
        id: mockStepBlock.id,
        __typename: 'StepBlock',
        nextBlockId: mockStepBlock.nextBlockId
      }
    }
  }
}

export const blockRestoreWithStepUpdate: MockedResponse<
  BlockRestoreWithStepUpdate,
  BlockRestoreWithStepUpdateVariables
> = {
  request: {
    query: BLOCK_RESTORE_WITH_STEP_UPDATE,
    variables: {
      id: 'newStep.id',
      journeyId: 'journey-id',
      stepBlockUpdateId: 'originStepBlock.id',
      input: { nextBlockId: mockNewStepBlock.id }
    }
  },
  result: {
    data: {
      blockRestore: [{ ...mockStepBlock, x: 777, y: 777 }],
      stepBlockUpdate: {
        id: mockStepBlock.id,
        __typename: 'StepBlock',
        nextBlockId: mockNewStepBlock.id
      }
    }
  }
}
