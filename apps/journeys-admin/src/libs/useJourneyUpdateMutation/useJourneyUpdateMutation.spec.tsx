import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

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
          languageId: '529',
          website: true
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyUpdate: {
          ...defaultJourney,
          __typename: 'Journey',
          id: 'journeyId',
          title: 'New Title',
          description: 'New Description',
          strategySlug: 'www.example.com/embed',
          tags: [{ __typename: 'Tag', id: 'tagId' }],
          language: {
            id: '529',
            __typename: 'Language',
            bcp47: null,
            iso3: null,
            name: [
              {
                __typename: 'LanguageName',
                value: 'English',
                primary: true
              }
            ]
          },
          website: true,
          showShareButton: true,
          showLikeButton: true,
          showDislikeButton: true,
          displayTitle: 'display title'
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
              languageId: '529',
              website: true
            }
          }
        })
        expect(journeyUpdateMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
