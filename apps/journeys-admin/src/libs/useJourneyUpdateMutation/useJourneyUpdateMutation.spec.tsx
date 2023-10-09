import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  useJourneyUpdateMutation,
  JOURNEY_SETTINGS_UPDATE
} from './useJourneyUpdateMutation'
import { JourneySettingsUpdate } from '../../../__generated__/JourneySettingsUpdate'

describe('useJourneyUpdateMutation', () => {
  const journeyUpdateMutationMock: MockedResponse<JourneySettingsUpdate> = {
    request: {
      query: JOURNEY_SETTINGS_UPDATE,
      variables: {
        id: 'journeyId',
        input: {
          title: 'New Title',
          description: 'New Description',
          strategySlug: 'www.example.com/embed'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journeyId',
          title: 'New Title',
          description: 'New Description',
          strategySlug: 'www.example.com/embed'
        }
      }
    }))
  }
  it('should update journey details', async () => {
    const { result } = renderHook(() => useJourneyUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[journeyUpdateMutationMock]}>
          {children}
        </MockedProvider>
      )
    })

    await result.current[0]({
      variables: {
        id: 'journeyId',
        input: {
          title: 'New Title',
          description: 'New Description',
          strategySlug: 'www.example.com/embed'
        }
      }
    })

    await act(async () => {
      await waitFor(async () => {
        expect(journeyUpdateMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
