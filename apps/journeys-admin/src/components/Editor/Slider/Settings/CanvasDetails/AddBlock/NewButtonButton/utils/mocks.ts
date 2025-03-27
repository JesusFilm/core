import { MockedResponse } from '@apollo/client/testing'

import type { TreeBlock } from '@core/journeys/ui/block'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockCreate,
  ButtonBlockCreateVariables
} from '../../../../../../../../../__generated__/ButtonBlockCreate'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TextResponseType
} from '../../../../../../../../../__generated__/globalTypes'
import { BUTTON_BLOCK_CREATE } from '../NewButtonButton'

// Reusable block fixtures
export const textResponseBlock: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponseId',
  parentBlockId: 'cardId',
  parentOrder: 0,
  label: '',
  hint: null,
  minRows: null,
  type: TextResponseType.freeForm,
  routeId: null,
  integrationId: null,
  children: []
}

export const submitButtonBlock: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'existingButtonId',
  parentBlockId: 'cardId',
  parentOrder: 1,
  label: '',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.medium,
  startIconId: null,
  endIconId: null,
  action: null,
  submitEnabled: true,
  children: []
}

// Helper functions
export const createCardBlock = (children: TreeBlock[]) => ({
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children
})

export const createStepBlock = (cardChildren: TreeBlock[]) => ({
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: [createCardBlock(cardChildren)]
})

// Mutation mocks
export const buttonBlockCreateMock: MockedResponse<
  ButtonBlockCreate,
  ButtonBlockCreateVariables
> = {
  request: {
    query: BUTTON_BLOCK_CREATE,
    variables: {
      input: {
        id: 'buttonBlockId',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        label: '',
        variant: ButtonVariant.contained,
        color: ButtonColor.primary,
        size: ButtonSize.medium,
        submitEnabled: false
      },
      iconBlockCreateInput1: {
        id: 'startIconId',
        journeyId: 'journeyId',
        parentBlockId: 'buttonBlockId',
        name: null
      },
      iconBlockCreateInput2: {
        id: 'endIconId',
        journeyId: 'journeyId',
        parentBlockId: 'buttonBlockId',
        name: null
      },
      id: 'buttonBlockId',
      journeyId: 'journeyId',
      updateInput: {
        startIconId: 'startIconId',
        endIconId: 'endIconId'
      }
    }
  },
  result: {
    data: {
      buttonBlockCreate: {
        __typename: 'ButtonBlock',
        id: 'buttonBlockId'
      },
      startIcon: {
        __typename: 'IconBlock',
        id: 'startIconId',
        parentBlockId: 'buttonBlockId',
        parentOrder: null,
        iconName: null,
        iconColor: null,
        iconSize: null
      },
      endIcon: {
        __typename: 'IconBlock',
        id: 'endIconId',
        parentBlockId: 'buttonBlockId',
        parentOrder: null,
        iconName: null,
        iconColor: null,
        iconSize: null
      },
      buttonBlockUpdate: {
        __typename: 'ButtonBlock',
        id: 'buttonBlockId',
        parentBlockId: 'cardId',
        parentOrder: 0,
        label: '',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: 'startIconId',
        endIconId: 'endIconId',
        action: null,
        submitEnabled: false
      }
    } as ButtonBlockCreate
  }
}

export const submitButtonCreateMock: MockedResponse<ButtonBlockCreate> = {
  ...buttonBlockCreateMock,
  request: {
    query: BUTTON_BLOCK_CREATE,
    variables: {
      input: {
        ...buttonBlockCreateMock.request.variables?.input,
        submitEnabled: true
      },
      iconBlockCreateInput1:
        buttonBlockCreateMock.request.variables?.iconBlockCreateInput1,
      iconBlockCreateInput2:
        buttonBlockCreateMock.request.variables?.iconBlockCreateInput2,
      id: buttonBlockCreateMock.request.variables?.id,
      journeyId: buttonBlockCreateMock.request.variables?.journeyId,
      updateInput: buttonBlockCreateMock.request.variables?.updateInput
    }
  },
  result: {
    data: {
      buttonBlockCreate: {
        __typename: 'ButtonBlock',
        id: 'buttonBlockId'
      },
      startIcon: {
        __typename: 'IconBlock',
        id: 'startIconId',
        parentBlockId: 'buttonBlockId',
        parentOrder: null,
        iconName: null,
        iconColor: null,
        iconSize: null
      },
      endIcon: {
        __typename: 'IconBlock',
        id: 'endIconId',
        parentBlockId: 'buttonBlockId',
        parentOrder: null,
        iconName: null,
        iconColor: null,
        iconSize: null
      },
      buttonBlockUpdate: {
        __typename: 'ButtonBlock',
        id: 'buttonBlockId',
        parentBlockId: 'cardId',
        parentOrder: 0,
        label: '',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: 'startIconId',
        endIconId: 'endIconId',
        action: null,
        submitEnabled: true
      }
    } as ButtonBlockCreate
  }
}
