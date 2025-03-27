import { MockedResponse } from '@apollo/client/testing'

import type { TreeBlock } from '@core/journeys/ui/block'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { TextResponseBlockCreate } from '../../../../../../../../../__generated__/TextResponseBlockCreate'
import {
  TextResponseWithButtonCreate,
  TextResponseWithButtonCreateVariables
} from '../../../../../../../../../__generated__/TextResponseWithButtonCreate'
import {
  TextResponseWithButtonDelete,
  TextResponseWithButtonDeleteVariables
} from '../../../../../../../../../__generated__/TextResponseWithButtonDelete'
import {
  TextResponseWithButtonRestore,
  TextResponseWithButtonRestoreVariables
} from '../../../../../../../../../__generated__/TextResponseWithButtonRestore'

import {
  TEXT_RESPONSE_BLOCK_CREATE,
  TEXT_RESPONSE_WITH_BUTTON_CREATE,
  TEXT_RESPONSE_WITH_BUTTON_DELETE,
  TEXT_RESPONSE_WITH_BUTTON_RESTORE
} from './mutations'

export const submitButton: TreeBlock<ButtonBlock> = {
  id: 'submitButton.id',
  __typename: 'ButtonBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  label: 'Submit',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.medium,
  startIconId: null,
  endIconId: null,
  action: null,
  submitEnabled: true,
  children: []
}

export const stepWithSubmitButton: TreeBlock<StepBlock> = {
  id: 'step.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: null,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [
    {
      id: 'card.id',
      __typename: 'CardBlock',
      parentBlockId: 'step.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [submitButton]
    }
  ]
}

export const stepWithoutSubmitButton: TreeBlock<StepBlock> = {
  id: 'step.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: null,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [
    {
      id: 'card.id',
      __typename: 'CardBlock',
      parentBlockId: 'step.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
  ]
}

export const textResponseBlockCreateMock: MockedResponse<TextResponseBlockCreate> =
  {
    request: {
      query: TEXT_RESPONSE_BLOCK_CREATE,
      variables: {
        input: {
          id: 'textResponseBlock.id',
          journeyId: 'journey.id',
          parentBlockId: 'card.id',
          label: 'Your answer here'
        }
      }
    },
    result: {
      data: {
        textResponseBlockCreate: {
          __typename: 'TextResponseBlock',
          id: 'textResponseBlock.id',
          parentBlockId: 'card.id',
          parentOrder: 0,
          label: 'Your answer here',
          hint: null,
          minRows: null,
          type: null,
          routeId: null,
          integrationId: null
        }
      }
    }
  }

export const textResponseWithButtonCreateMock: MockedResponse<
  TextResponseWithButtonCreate,
  TextResponseWithButtonCreateVariables
> = {
  request: {
    query: TEXT_RESPONSE_WITH_BUTTON_CREATE,
    variables: {
      textResponseInput: {
        id: 'textResponse.id',
        journeyId: 'journey.id',
        parentBlockId: 'card.id',
        label: 'Your answer here'
      },
      buttonInput: {
        id: 'button.id',
        journeyId: 'journey.id',
        parentBlockId: 'card.id',
        label: 'Submit',
        variant: ButtonVariant.contained,
        color: ButtonColor.primary,
        size: ButtonSize.medium,
        submitEnabled: true
      },
      iconInput1: {
        id: 'startIcon.id',
        journeyId: 'journey.id',
        parentBlockId: 'button.id',
        name: null
      },
      iconInput2: {
        id: 'endIcon.id',
        journeyId: 'journey.id',
        parentBlockId: 'button.id',
        name: null
      },
      buttonId: 'button.id',
      journeyId: 'journey.id',
      buttonUpdateInput: {
        startIconId: 'startIcon.id',
        endIconId: 'endIcon.id'
      }
    }
  },
  result: {
    data: {
      textResponse: {
        id: 'textResponse.id',
        parentBlockId: 'card.id',
        parentOrder: 0,
        label: 'Your answer here',
        hint: null,
        minRows: null,
        type: null,
        routeId: null,
        integrationId: null,
        __typename: 'TextResponseBlock'
      },
      button: {
        id: 'button.id',
        parentBlockId: 'card.id',
        parentOrder: 1,
        label: 'Submit',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: null,
        endIconId: null,
        action: null,
        submitEnabled: true,
        __typename: 'ButtonBlock'
      },
      startIcon: {
        id: 'startIcon.id',
        parentBlockId: 'button.id',
        parentOrder: null,
        iconName: null,
        iconSize: null,
        iconColor: null,
        __typename: 'IconBlock'
      },
      endIcon: {
        id: 'endIcon.id',
        parentBlockId: 'button.id',
        parentOrder: null,
        iconName: null,
        iconSize: null,
        iconColor: null,
        __typename: 'IconBlock'
      },
      buttonUpdate: {
        id: 'button.id',
        parentBlockId: 'card.id',
        parentOrder: 1,
        label: 'Submit',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        startIconId: 'startIcon.id',
        endIconId: 'endIcon.id',
        action: null,
        submitEnabled: true,
        __typename: 'ButtonBlock'
      }
    }
  }
}

export const textResponseWithButtonDeleteMock: MockedResponse<
  TextResponseWithButtonDelete,
  TextResponseWithButtonDeleteVariables
> = {
  request: {
    query: TEXT_RESPONSE_WITH_BUTTON_DELETE,
    variables: {
      textResponseId: 'textResponse.id',
      buttonId: 'button.id',
      startIconId: 'startIcon.id',
      endIconId: 'endIcon.id'
    }
  },
  result: {
    data: {
      textResponse: [
        {
          id: 'textResponse.id',
          parentOrder: 0,
          __typename: 'TextResponseBlock'
        }
      ],
      button: [
        {
          id: 'button.id',
          parentOrder: 1,
          __typename: 'ButtonBlock'
        }
      ],
      startIcon: [
        {
          id: 'startIcon.id',
          parentOrder: null,
          __typename: 'IconBlock'
        }
      ],
      endIcon: [
        {
          id: 'endIcon.id',
          parentOrder: null,
          __typename: 'IconBlock'
        }
      ]
    }
  }
}

export const textResponseWithButtonRestoreMock: MockedResponse<
  TextResponseWithButtonRestore,
  TextResponseWithButtonRestoreVariables
> = {
  request: {
    query: TEXT_RESPONSE_WITH_BUTTON_RESTORE,
    variables: {
      textResponseId: 'textResponse.id',
      buttonId: 'button.id',
      startIconId: 'startIcon.id',
      endIconId: 'endIcon.id'
    }
  },
  result: {
    data: {
      textResponse: [
        {
          id: 'textResponse.id',
          parentBlockId: 'card.id',
          parentOrder: 0,
          label: 'Your answer here',
          hint: null,
          minRows: null,
          type: null,
          routeId: null,
          integrationId: null,
          __typename: 'TextResponseBlock'
        }
      ],
      button: [
        {
          id: 'button.id',
          parentBlockId: 'card.id',
          parentOrder: 1,
          label: 'Submit',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: 'startIcon.id',
          endIconId: 'endIcon.id',
          action: null,
          submitEnabled: true,
          __typename: 'ButtonBlock'
        }
      ],
      startIcon: [
        {
          id: 'startIcon.id',
          parentBlockId: 'button.id',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        }
      ],
      endIcon: [
        {
          id: 'endIcon.id',
          parentBlockId: 'button.id',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        }
      ]
    }
  }
}
