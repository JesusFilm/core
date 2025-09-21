import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID } from './useGetChildTemplateJourneyLanguages'

import { useGetChildTemplateJourneyLanguages } from '.'

import {
  mockChildJourneys,
  mockChildVariables
} from './useGetChildTemplateJourneyLanguages.mock'

describe('useGetChildTemplateJourneyLanguages', () => {
  it('should fetch and return child journeys with languages', async () => {
    const result = jest.fn().mockReturnValue(mockChildJourneys.result)

    const { result: hookResult } = renderHook(
      () =>
        useGetChildTemplateJourneyLanguages({ variables: mockChildVariables }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID,
                  variables: mockChildVariables
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

    expect(hookResult.current.languages).toHaveLength(2)
    expect(hookResult.current.languagesJourneyMap).toEqual({
      'language-1': 'journey-1',
      'language-2': 'journey-2'
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
  })
})
