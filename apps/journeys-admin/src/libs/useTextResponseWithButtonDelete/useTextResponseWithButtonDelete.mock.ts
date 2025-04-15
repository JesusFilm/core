import { MockedResponse } from '@apollo/client/testing'

import {
  TextResponseWithButtonDelete,
  TextResponseWithButtonDeleteVariables
} from '../../../__generated__/TextResponseWithButtonDelete'

import { TEXT_RESPONSE_WITH_BUTTON_DELETE } from './useTextResponseWithButtonDelete'

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
  result: jest.fn(() => ({
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
  }))
}
