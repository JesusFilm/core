import { MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  StepBlockCreateFromStep,
  StepBlockCreateFromStepVariables
} from '../../../../../../../__generated__/StepBlockCreateFromStep'
import {
  StepBlockDeleteFromStep,
  StepBlockDeleteFromStepVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromStep'
import {
  StepBlockRestoreFromStep,
  StepBlockRestoreFromStepVariables
} from '../../../../../../../__generated__/StepBlockRestoreFromStep'

import {
  STEP_BLOCK_CREATE_FROM_STEP,
  STEP_BLOCK_DELETE_FROM_STEP,
  STEP_BLOCK_RESTORE_FROM_STEP
} from './useCreateStepFromStep'

export const mockStepBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'originStepBlock.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: [],
  slug: null
}

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

export const mockStepBlockCreateFromStep: MockedResponse<
  StepBlockCreateFromStep,
  StepBlockCreateFromStepVariables
> = {
  request: {
    query: STEP_BLOCK_CREATE_FROM_STEP,
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
        y: 777,
        slug: null
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
        fullscreen: false,
        backdropBlur: null
      },
      stepBlockUpdate: {
        id: 'originStepBlock.id',
        __typename: 'StepBlock',
        nextBlockId: 'newCard.id'
      }
    }
  }
}

export const mockStepBlockDeleteFromStep: MockedResponse<
  StepBlockDeleteFromStep,
  StepBlockDeleteFromStepVariables
> = {
  request: {
    query: STEP_BLOCK_DELETE_FROM_STEP,
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

export const mockStepBlockRestoreFromStep: MockedResponse<
  StepBlockRestoreFromStep,
  StepBlockRestoreFromStepVariables
> = {
  request: {
    query: STEP_BLOCK_RESTORE_FROM_STEP,
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
