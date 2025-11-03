import { MockedResponse } from '@apollo/client/testing'

import {
  CreateHost,
  CreateHostVariables
} from '../../../__generated__/CreateHost'

import { CREATE_HOST } from './useHostCreateMutation'

export const hostCreateMock: MockedResponse<CreateHost, CreateHostVariables> = {
  request: {
    query: CREATE_HOST,
    variables: { teamId: 'team.id', input: { title: 'value' } }
  },
  result: {
    data: {
      hostCreate: {
        __typename: 'Host',
        id: 'host.id',
        title: 'value'
      }
    }
  }
}
