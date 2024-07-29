import { MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'

import {
  StepBlockCreate,
  StepBlockCreateVariables
} from '../../../../../../../__generated__/StepBlockCreate'
import {
  StepBlockDelete,
  StepBlockDeleteVariables
} from '../../../../../../../__generated__/StepBlockDelete'
import {
  StepBlockRestore,
  StepBlockRestoreVariables
} from '../../../../../../../__generated__/StepBlockRestore'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  STEP_BLOCK_CREATE,
  STEP_BLOCK_DELETE,
  STEP_BLOCK_RESTORE
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

export const mockStepBlockCreate: MockedResponse<
  StepBlockCreate,
  StepBlockCreateVariables
> = {
  request: {
    query: STEP_BLOCK_CREATE,
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

export const mockStepBlockDelete: MockedResponse<
  StepBlockDelete,
  StepBlockDeleteVariables
> = {
  request: {
    query: STEP_BLOCK_DELETE,
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

export const mockStepBlockRestore: MockedResponse<
  StepBlockRestore,
  StepBlockRestoreVariables
> = {
  request: {
    query: STEP_BLOCK_RESTORE,
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
