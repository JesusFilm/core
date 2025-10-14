import { MockLink } from '@apollo/client/testing';
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from '@testing-library/react'

import { GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID } from './useGetParentTemplateJourneyLanguages'
import {
  mockParentJourneys,
  mockParentVariables
} from './useGetParentTemplateJourneyLanguages.mock'

import { useGetParentTemplateJourneyLanguages } from '.'

describe('useGetParentTemplateJourneyLanguages', () => {
  it('should fetch and return parent journeys with languages', async () => {
    const result = jest.fn().mockReturnValue(mockParentJourneys.result)

    const { result: hookResult } = renderHook(
      () =>
        useGetParentTemplateJourneyLanguages({
          variables: mockParentVariables
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID,
                  variables: mockParentVariables
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

    await act(() => waitFor(() => expect(result).toHaveBeenCalled()))

    expect(hookResult.current.languages).toHaveLength(1)
    expect(hookResult.current.languagesJourneyMap).toEqual({
      'language-1': 'parent-journey-1'
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
  })
})
