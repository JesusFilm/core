import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GET_CUSTOM_DOMAINS } from './useCustomDomainsQuery'

import { useCustomDomainsQuery } from '.'

const customDomains = {
  customDomains: [
    {
      __typename: 'CustomDomain' as const,
      name: 'mockdomain.com',
      apexName: 'mockdomain.com',
      id: 'customDomainId',
      teamId: 'teamId',
      verification: {
        __typename: 'CustomDomainVerification' as const,
        verified: true,
        verification: []
      },
      configuration: {
        __typename: 'VercelDomainConfiguration' as const,
        misconfigured: false
      },
      journeyCollection: {
        __typename: 'JourneyCollection' as const,
        id: 'journeyCollectionId',
        journeys: []
      }
    }
  ]
}

describe('useCustomDomainsQuery', () => {
  it('should get custom domain for a team', async () => {
    const result = jest.fn(() => ({
      data: {
        customDomains
      }
    }))

    renderHook(
      () =>
        useCustomDomainsQuery({
          variables: { teamId: 'teamId' }
        }),
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
  })
})
