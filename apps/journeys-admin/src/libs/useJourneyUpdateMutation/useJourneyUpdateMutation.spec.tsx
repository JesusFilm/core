import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { JourneySettingsUpdate } from '../../../__generated__/JourneySettingsUpdate'

import {
  JOURNEY_SETTINGS_UPDATE,
  useJourneyUpdateMutation
} from './useJourneyUpdateMutation'

describe('useJourneyUpdateMutation', () => {
  const journeyUpdateMutationMock: MockedResponse<JourneySettingsUpdate> = {
    request: {
      query: JOURNEY_SETTINGS_UPDATE,
      variables: {
        id: 'journeyId',
        input: {
          title: 'New Title',
          description: 'New Description',
          strategySlug: 'www.example.com/embed',
          tagIds: ['tagId'],
          languageId: '529'
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
          strategySlug: 'www.example.com/embed',
          tags: [{ __typename: 'Tag', id: 'tagId' }],
          language: { id: '529' }
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

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: 'journeyId',
            input: {
              title: 'New Title',
              description: 'New Description',
              strategySlug: 'www.example.com/embed',
              tagIds: ['tagId'],
              languageId: '529'
            }
          }
        })
        expect(journeyUpdateMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
