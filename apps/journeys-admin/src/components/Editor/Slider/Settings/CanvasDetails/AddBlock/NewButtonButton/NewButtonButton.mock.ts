import { MockedResponse } from '@apollo/client/testing'

import type { TreeBlock } from '@core/journeys/ui/block'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockCreate,
  ButtonBlockCreateVariables
} from '../../../../../../../../__generated__/ButtonBlockCreate'
import {
  ButtonAlignment,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TextResponseType
} from '../../../../../../../../__generated__/globalTypes'

import { BUTTON_BLOCK_CREATE } from './NewButtonButton'

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
  placeholder: null,
  required: null,
  children: [],
  hideLabel: true
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
  settings: {
    __typename: 'ButtonBlockSettings',
    alignment: ButtonAlignment.justify
  },
  children: []
}

export const createCardBlock = (
  children: TreeBlock[]
): TreeBlock<CardBlock> => ({
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  children
})

export const createStepBlock = (
  cardChildren: TreeBlock[]
): TreeBlock<StepBlock> => ({
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: [createCardBlock(cardChildren)]
})

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
        submitEnabled: false,
        settings: {
          alignment: ButtonAlignment.justify
        }
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
  result: jest.fn(() => ({
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
        submitEnabled: false,
        settings: {
          alignment: ButtonAlignment.justify
        }
      }
    } as ButtonBlockCreate
  }))
}

export const submitButtonCreateMock: MockedResponse<
  ButtonBlockCreate,
  ButtonBlockCreateVariables
> = {
  request: {
    query: BUTTON_BLOCK_CREATE,
    variables: {
      input: {
        id: 'submitButtonBlockId',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        label: '',
        variant: ButtonVariant.contained,
        color: ButtonColor.primary,
        size: ButtonSize.medium,
        submitEnabled: true,
        settings: {
          alignment: ButtonAlignment.justify
        }
      },
      iconBlockCreateInput1: {
        id: 'submitStartIconId',
        journeyId: 'journeyId',
        parentBlockId: 'submitButtonBlockId',
        name: null
      },
      iconBlockCreateInput2: {
        id: 'submitEndIconId',
        journeyId: 'journeyId',
        parentBlockId: 'submitButtonBlockId',
        name: null
      },
      id: 'submitButtonBlockId',
      journeyId: 'journeyId',
      updateInput: {
        startIconId: 'submitStartIconId',
        endIconId: 'submitEndIconId'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      buttonBlockCreate: {
        __typename: 'ButtonBlock',
        id: 'submitButtonBlockId'
      },
      startIcon: {
        __typename: 'IconBlock',
        id: 'submitStartIconId',
        parentBlockId: 'submitButtonBlockId',
        parentOrder: null,
        iconName: null,
        iconColor: null,
        iconSize: null
      },
      endIcon: {
        __typename: 'IconBlock',
        id: 'submitEndIconId',
        parentBlockId: 'submitButtonBlockId',
        parentOrder: null,
        iconName: null,
        iconColor: null,
        iconSize: null
      },
      buttonBlockUpdate: {
        __typename: 'ButtonBlock',
        id: 'submitButtonBlockId',
        parentBlockId: 'cardId',
        parentOrder: 0,
        label: '',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: 'submitStartIconId',
        endIconId: 'submitEndIconId',
        action: null,
        submitEnabled: true,
        settings: {
          alignment: ButtonAlignment.justify
        }
      }
    } as ButtonBlockCreate
  }))
}
