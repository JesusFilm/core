import { MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  StepBlockCreateFromAction,
  StepBlockCreateFromActionVariables
} from '../../../../../../../__generated__/StepBlockCreateFromAction'
import {
  StepBlockDeleteFromAction,
  StepBlockDeleteFromActionVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromAction'
import {
  StepBlockDeleteFromActionWithoutAction,
  StepBlockDeleteFromActionWithoutActionVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromActionWithoutAction'
import {
  StepBlockRestoreFromAction,
  StepBlockRestoreFromActionVariables
} from '../../../../../../../__generated__/StepBlockRestoreFromAction'

import {
  STEP_BLOCK_CREATE_FROM_ACTION,
  STEP_BLOCK_DELETE_FROM_ACTION,
  STEP_BLOCK_DELETE_FROM_ACTION_WITHOUT_ACTION,
  STEP_BLOCK_RESTORE_FROM_ACTION
} from './useCreateStepFromAction'

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

export const mockOriginButtonBlockWithoutAction: TreeBlock<ButtonBlock> = {
  ...mockOriginButtonBlock,
  action: null
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

export const mockStepBlockCreateFromAction: MockedResponse<
  StepBlockCreateFromAction,
  StepBlockCreateFromActionVariables
> = {
  request: {
    query: STEP_BLOCK_CREATE_FROM_ACTION,
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

export const mockStepBlockDeleteFromAction: MockedResponse<
  StepBlockDeleteFromAction,
  StepBlockDeleteFromActionVariables
> = {
  request: {
    query: STEP_BLOCK_DELETE_FROM_ACTION,
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

export const stepBlockDeleteFromActionWithoutAction: MockedResponse<
  StepBlockDeleteFromActionWithoutAction,
  StepBlockDeleteFromActionWithoutActionVariables
> = {
  request: {
    query: STEP_BLOCK_DELETE_FROM_ACTION_WITHOUT_ACTION,
    variables: {
      id: 'newStep.id',
      journeyId: 'journey-id',
      blockDeleteActionId: 'button.id'
    }
  },
  result: {
    data: {
      blockDelete: [],
      blockDeleteAction: {
        id: mockOriginButtonBlockWithoutAction.id,
        __typename: mockOriginButtonBlockWithoutAction.__typename,
        action: null
      }
    }
  }
}

export const mockBlockRestoreFromAction: MockedResponse<
  StepBlockRestoreFromAction,
  StepBlockRestoreFromActionVariables
> = {
  request: {
    query: STEP_BLOCK_RESTORE_FROM_ACTION,
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
