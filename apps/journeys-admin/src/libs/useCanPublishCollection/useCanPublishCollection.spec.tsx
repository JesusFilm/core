import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'

import { GET_CUSTOM_DOMAINS } from '../useCustomDomainsQuery/useCustomDomainsQuery'

import {
  CUSTOM_DOMAIN_PUBLISH_BLOCKED_COPY,
  useCanPublishCollection
} from './useCanPublishCollection'

function makeMock(
  customDomains: Array<{
    name: string
    routeAllTeamJourneys: boolean
  }>,
  teamId = 'teamId'
): MockedResponse {
  return {
    request: {
      query: GET_CUSTOM_DOMAINS,
      variables: { teamId }
    },
    result: {
      data: {
        customDomains: customDomains.map((d, i) => ({
          __typename: 'CustomDomain',
          id: `id-${i}`,
          name: d.name,
          apexName: d.name,
          routeAllTeamJourneys: d.routeAllTeamJourneys,
          journeyCollection: null
        }))
      }
    }
  }
}

function wrapWith(mocks: MockedResponse[]) {
  return function Wrapper({
    children
  }: {
    children: React.ReactNode
  }): React.ReactElement {
    return <MockedProvider mocks={mocks}>{children}</MockedProvider>
  }
}

describe('useCanPublishCollection', () => {
  it('returns canPublish: false (no team) and loading: false when teamId is null', () => {
    const { result } = renderHook(
      () => useCanPublishCollection({ teamId: null }),
      { wrapper: wrapWith([]) }
    )
    expect(result.current).toEqual({
      canPublish: false,
      reason: null,
      loading: false
    })
  })

  it('returns canPublish: false (no team) when teamId is undefined', () => {
    const { result } = renderHook(
      () => useCanPublishCollection({ teamId: undefined }),
      { wrapper: wrapWith([]) }
    )
    expect(result.current.canPublish).toBe(false)
    expect(result.current.reason).toBeNull()
  })

  it('returns canPublish: true when the team has no custom domains', async () => {
    const mock = makeMock([])
    const { result } = renderHook(
      () => useCanPublishCollection({ teamId: 'teamId' }),
      { wrapper: wrapWith([mock]) }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canPublish).toBe(true)
    expect(result.current.reason).toBeNull()
  })

  it('returns canPublish: true when no domain has routeAllTeamJourneys', async () => {
    const mock = makeMock([
      { name: 'a.com', routeAllTeamJourneys: false },
      { name: 'b.com', routeAllTeamJourneys: false }
    ])
    const { result } = renderHook(
      () => useCanPublishCollection({ teamId: 'teamId' }),
      { wrapper: wrapWith([mock]) }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canPublish).toBe(true)
    expect(result.current.reason).toBeNull()
  })

  it('returns canPublish: false + the verbatim reason copy when any domain has routeAllTeamJourneys', async () => {
    const mock = makeMock([
      { name: 'a.com', routeAllTeamJourneys: false },
      { name: 'b.com', routeAllTeamJourneys: true }
    ])
    const { result } = renderHook(
      () => useCanPublishCollection({ teamId: 'teamId' }),
      { wrapper: wrapWith([mock]) }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canPublish).toBe(false)
    expect(result.current.reason).toBe(CUSTOM_DOMAIN_PUBLISH_BLOCKED_COPY)
  })

  it('exports the verbatim NES-1644 copy', () => {
    expect(CUSTOM_DOMAIN_PUBLISH_BLOCKED_COPY).toBe(
      "Teams with custom domains can't publish template galleries. Contact support if you need this."
    )
  })
})
