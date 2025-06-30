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
import {
  StepBlockCreateFromSocialPreview,
  StepBlockCreateFromSocialPreviewVariables
} from '../../../../../../../__generated__/StepBlockCreateFromSocialPreview'
import {
  StepBlockDeleteFromSocialPreview,
  StepBlockDeleteFromSocialPreviewVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromSocialPreview'
import {
  StepBlockRestoreFromSocialPreview,
  StepBlockRestoreFromSocialPreviewVariables
} from '../../../../../../../__generated__/StepBlockRestoreFromSocialPreview'
import { BLOCK_DELETE } from '../../../../../../libs/useBlockDeleteMutation'

import {
  STEP_BLOCK_CREATE_FROM_SOCIAL_PREVIEW,
  STEP_BLOCK_DELETE_FROM_SOCIAL_PREVIEW,
  STEP_BLOCK_RESTORE_FROM_SOCIAL_PREVIEW
} from './useCreateStepFromSocialPreview'

export const mockNewStepBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'newStep.id',
  parentBlockId: null,
  parentOrder: 0,
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

export const mockStepBlockCreateFromSocialPreview: MockedResponse<
  StepBlockCreateFromSocialPreview,
  StepBlockCreateFromSocialPreviewVariables
> = {
  request: {
    query: STEP_BLOCK_CREATE_FROM_SOCIAL_PREVIEW,
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

export const mockStepBlockDeleteFromSocialPreview: MockedResponse<
  StepBlockDeleteFromSocialPreview,
  StepBlockDeleteFromSocialPreviewVariables
> = {
  request: {
    query: STEP_BLOCK_DELETE_FROM_SOCIAL_PREVIEW,
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
        id: mockNewStepBlock.id
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

export const mockStepBlockRestoreFromSocialPreview: MockedResponse<
  StepBlockRestoreFromSocialPreview,
  StepBlockRestoreFromSocialPreviewVariables
> = {
  request: {
    query: STEP_BLOCK_RESTORE_FROM_SOCIAL_PREVIEW,
    variables: { id: 'newStep.id', stepId: 'newStep.id', parentOrder: 0 }
  },
  result: {
    data: {
      blockRestore: [{ ...mockNewStepBlock, x: 777, y: 777 }, mockNewCardBlock],
      blockOrderUpdate: [mockNewStepBlock]
    }
  }
}
