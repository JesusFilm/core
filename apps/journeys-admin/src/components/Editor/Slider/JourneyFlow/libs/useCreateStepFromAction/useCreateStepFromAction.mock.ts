import { MockedResponse } from '@apollo/client/testing'
import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'
import {
  BlockDeleteWithBlockActionUpdate,
  BlockDeleteWithBlockActionUpdateVariables
} from '../../../../../../../__generated__/BlockDeleteWithBlockActionUpdate'
import {
  BlockRestoreWithBlockActionUpdate,
  BlockRestoreWithBlockActionUpdateVariables
} from '../../../../../../../__generated__/BlockRestoreWithBlockActionUpdate'
import {
  StepAndCardBlockCreateWithBlockActionUpdate,
  StepAndCardBlockCreateWithBlockActionUpdateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreateWithBlockActionUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  BLOCK_DELETE_WITH_BLOCK_ACTION_UPDATE,
  BLOCK_RESTORE_WITH_BLOCK_ACTION_UPDATE,
  STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ACTION_UPDATE
} from './useCreateStepFromAction'

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

export const mockOriginButtonBlock: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'button.id',
  parentBlockId: null,
  parentOrder: 1,
  action: {
    __typename: 'NaveigateToBlockAction',
    blockId: mockNewStepBlock.id
  },
  children: []
} as unknown as TreeBlock<ButtonBlock>

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

export const mockStepAndCardBlockCreateWithBlockActionUpdate: MockedResponse<
  StepAndCardBlockCreateWithBlockActionUpdate,
  StepAndCardBlockCreateWithBlockActionUpdateVariables
> = {
  request: {
    query: STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ACTION_UPDATE,
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
      blockId: 'button.id',
      blockUpdateActionInput: { gtmEventName: null, blockId: 'newStep.id' }
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
      blockUpdateAction: {
        parentBlockId: mockOriginButtonBlock.id,
        __typename: 'NavigateToBlockAction',
        gtmEventName: mockOriginButtonBlock?.action?.gtmEventName ?? null,
        parentBlock: {
          ...mockOriginButtonBlock
        }
      }
    }
  }
}

export const mockBlockDeleteWithBlockActionUpdate: MockedResponse<
  BlockDeleteWithBlockActionUpdate,
  BlockDeleteWithBlockActionUpdateVariables
> = {
  request: {
    query: BLOCK_DELETE_WITH_BLOCK_ACTION_UPDATE,
    variables: {
      id: 'newStep.id',
      journeyId: 'journey-id',
      blockUpdateActionId: 'button.id',
      input: {
        gtmEventName: null,
        email: null,
        url: null,
        blockId: 'newStep.id',
        target: null
      }
    }
  },
  result: {
    data: {
      blockDelete: [],
      blockUpdateAction: {
        parentBlockId: mockOriginButtonBlock.id,
        __typename: 'NavigateToBlockAction',
        parentBlock: {
          ...mockOriginButtonBlock
        },
        gtmEventName: mockOriginButtonBlock?.action?.gtmEventName ?? null
      }
    }
  }
}

export const mockBlockRestoreWithBlockActionUpdate: MockedResponse<
  BlockRestoreWithBlockActionUpdate,
  BlockRestoreWithBlockActionUpdateVariables
> = {
  request: {
    query: BLOCK_RESTORE_WITH_BLOCK_ACTION_UPDATE,
    variables: {
      id: 'newStep.id',
      blockUpdateActionId: 'button.id',
      input: { gtmEventName: null, blockId: 'newStep.id' }
    }
  },
  result: {
    data: {
      blockRestore: [{ ...mockNewStepBlock, x: 777, y: 777 }, mockNewCardBlock],
      blockUpdateAction: {
        parentBlockId: mockOriginButtonBlock.id,
        __typename: 'NavigateToBlockAction',
        gtmEventName: mockOriginButtonBlock?.action?.gtmEventName ?? null,
        parentBlock: {
          ...mockOriginButtonBlock
        }
      }
    }
  }
}
