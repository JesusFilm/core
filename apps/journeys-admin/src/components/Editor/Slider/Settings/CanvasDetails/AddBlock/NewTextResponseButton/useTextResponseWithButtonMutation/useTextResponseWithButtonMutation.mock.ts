import { MockedResponse } from '@apollo/client/testing'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../__generated__/globalTypes'
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
  TEXT_RESPONSE_WITH_BUTTON_CREATE,
  TEXT_RESPONSE_WITH_BUTTON_DELETE,
  TEXT_RESPONSE_WITH_BUTTON_RESTORE
} from './useTextResponseWithButtonMutation'

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
        label: 'Label'
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
        label: 'Label',
        hint: null,
        minRows: null,
        type: null,
        routeId: null,
        integrationId: null,
        placeholder: null,
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
          label: 'Label',
          hint: null,
          minRows: null,
          type: null,
          routeId: null,
          integrationId: null,
          placeholder: null,
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
