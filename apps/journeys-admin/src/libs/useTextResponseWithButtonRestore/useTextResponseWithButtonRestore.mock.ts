import { MockedResponse } from '@apollo/client/testing'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../__generated__/globalTypes'
import {
  TextResponseWithButtonRestore,
  TextResponseWithButtonRestoreVariables
} from '../../../__generated__/TextResponseWithButtonRestore'

import { TEXT_RESPONSE_WITH_BUTTON_RESTORE } from './useTextResponseWithButtonRestore'

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
  result: jest.fn(() => ({
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
          required: null,
          __typename: 'TextResponseBlock'
        }
      ],
      button: [
        {
          id: 'button.id',
          parentBlockId: 'card.id',
          parentOrder: 1,
          label: '',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: 'startIcon.id',
          endIconId: 'endIcon.id',
          action: null,
          submitEnabled: true,
          settings: {
            __typename: 'ButtonBlockSettings',
            alignment: null,
            color: null
          },
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
  }))
}
