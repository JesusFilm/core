import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GET_JOURNEYS_FROM_TEMPLATE_ID } from './useTemplateJourneyLanguages'

import { useTemplateJourneyLanguages } from '.'

import { mockJourneys, mockVariables } from './useTemplateJourneyLanguages.mock'

describe('useTemplateJourneyLanguages', () => {
  it('should fetch and return journeys with languages', async () => {
    const result = jest.fn().mockReturnValue(mockJourneys.result)

    const { result: hookResult } = renderHook(
      () => useTemplateJourneyLanguages({ variables: mockVariables }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_JOURNEYS_FROM_TEMPLATE_ID,
                  variables: mockVariables
                },
                result
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )

    expect(hookResult.current.languages).toHaveLength(3)
    expect(hookResult.current.languagesJourneyMap).toEqual({
      'language-1': 'journey-1',
      'language-2': 'journey-2',
      'language-3': 'journey-3'
    })
    expect(hookResult.current.languages[0]).toEqual({
      __typename: 'Language',
      id: 'language-1',
      slug: 'en',
      name: [
        {
          __typename: 'LanguageName',
          primary: true,
          value: 'English'
        }
      ]
    })
    expect(hookResult.current.languages[1]).toEqual({
      __typename: 'Language',
      id: 'language-2',
      slug: 'es',
      name: [
        {
          __typename: 'LanguageName',
          primary: true,
          value: 'Spanish'
        }
      ]
    })
    expect(hookResult.current.languages[2]).toEqual({
      __typename: 'Language',
      id: 'language-3',
      slug: 'fr',
      name: [
        {
          __typename: 'LanguageName',
          primary: true,
          value: 'French'
        }
      ]
    })
  })
})
