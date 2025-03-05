import { MockedResponse } from '@apollo/client/testing'

import {
  CREATE_VIDEO_EDITION,
  CreateVideoEdition,
  CreateVideoEditionVariables
} from './useCreateEdition'

export const getCreateEditionMock = <
  T extends CreateVideoEditionVariables['input']
>(
  input: T
): MockedResponse<CreateVideoEdition, CreateVideoEditionVariables> => ({
  request: {
    query: CREATE_VIDEO_EDITION,
    variables: { input }
  },
  result: jest.fn(() => ({
    data: {
      videoEditionCreate: {
        id: 'edition.id',
        name: input.name
      }
    }
  }))
})
