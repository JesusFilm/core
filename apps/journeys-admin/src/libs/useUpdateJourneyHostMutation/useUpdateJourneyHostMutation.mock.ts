import { MockedResponse } from '@apollo/client/testing'

import {
  UpdateJourneyHost,
  UpdateJourneyHostVariables
} from '../../../__generated__/UpdateJourneyHost'

import { UPDATE_JOURNEY_HOST } from './useUpdateJourneyHostMutation'

export const updateJourneyHostMock: MockedResponse<
  UpdateJourneyHost,
  UpdateJourneyHostVariables
> = {
  request: {
    query: UPDATE_JOURNEY_HOST,
    variables: { id: 'journeyId', input: { hostId: 'host.id' } }
  },
  result: {
    data: {
      journeyUpdate: {
        __typename: 'Journey',
        id: 'journeyId',
        host: {
          __typename: 'Host',
          id: 'host.id'
        }
      }
    }
  }
}
