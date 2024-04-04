import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GetCustomDomains_customDomains as CustomDomain } from '../../../__generated__/GetCustomDomains'

import { GET_CUSTOM_DOMAINS } from './useCustomDomainsQuery'

import { useCustomDomainsQuery } from '.'

const customDomains: CustomDomain[] = [
  {
    __typename: 'CustomDomain',
    name: 'example.com',
    apexName: 'example.com',
    id: 'customDomainId',
    journeyCollection: {
      __typename: 'JourneyCollection',
      id: 'journeyCollectionId',
      journeys: []
    }
  }
]

describe('useCustomDomainsQuery', () => {
  it('should get custom domain for a team', async () => {
    const mockResult = jest.fn(() => ({
      data: {
        customDomains
      }
    }))

    const { result } = renderHook(
      () => {
        const { hostname } = useCustomDomainsQuery({
          variables: { teamId: 'teamId' }
        })

        return hostname
      },
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_CUSTOM_DOMAINS,
                  variables: {
                    teamId: 'teamId'
                  }
                },
                result: mockResult
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () => await waitFor(() => expect(mockResult).toHaveBeenCalled())
    )
    expect(result.current).toBe('example.com')
  })
})
