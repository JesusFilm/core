import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'

import { GET_CUSTOM_DOMAINS } from '../useCustomDomainsQuery/useCustomDomainsQuery'

import {
  CUSTOM_DOMAIN_PUBLISH_BLOCKED_BY_ERROR_COPY,
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
  // Mike's review #1: when teamId is null/undefined the hook can't tell
  // "no team selected" apart from "TeamProvider hasn't resolved yet", so
  // it fails open. The publish CTA stays enabled by default and the
  // caller can read `loading: true` if it wants to render a spinner.
  it('returns canPublish: true and loading: true when teamId is null (fail-open)', () => {
    const { result } = renderHook(
      () => useCanPublishCollection({ teamId: null }),
      { wrapper: wrapWith([]) }
    )
    expect(result.current).toEqual({
      canPublish: true,
      reason: null,
      loading: true
    })
  })

  it('returns canPublish: true and loading: true when teamId is undefined (fail-open)', () => {
    const { result } = renderHook(
      () => useCanPublishCollection({ teamId: undefined }),
      { wrapper: wrapWith([]) }
    )
    expect(result.current).toEqual({
      canPublish: true,
      reason: null,
      loading: true
    })
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

  // P1-E regression guard: when the customDomains query fails, we
  // can't tell whether the team has a routeAll domain. Block publish
  // (fail-closed) and surface a distinct "couldn't check" reason so
  // a custom-domain team doesn't slip through and publish a page that
  // won't route from their domain.
  describe('error path', () => {
    const errorMock: MockedResponse = {
      request: { query: GET_CUSTOM_DOMAINS, variables: { teamId: 'teamId' } },
      result: { errors: [new GraphQLError('Backend exploded')] }
    }
    let consoleWarn: jest.SpyInstance

    beforeEach(() => {
      consoleWarn = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
    })

    afterEach(() => {
      consoleWarn.mockRestore()
    })

    it('returns canPublish: false + the distinct error reason when the customDomains query fails', async () => {
      const { result } = renderHook(
        () => useCanPublishCollection({ teamId: 'teamId' }),
        { wrapper: wrapWith([errorMock]) }
      )
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.canPublish).toBe(false)
      expect(result.current.reason).toBe(
        CUSTOM_DOMAIN_PUBLISH_BLOCKED_BY_ERROR_COPY
      )
    })

    it('logs the error for operator visibility', async () => {
      const { result } = renderHook(
        () => useCanPublishCollection({ teamId: 'teamId' }),
        { wrapper: wrapWith([errorMock]) }
      )
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(consoleWarn).toHaveBeenCalledWith(
        '[useCanPublishCollection] customDomains query failed',
        expect.objectContaining({ teamId: 'teamId' })
      )
    })
  })
})
