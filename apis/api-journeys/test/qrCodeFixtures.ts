import { vi } from 'vitest'

// The short-link rewrite talks to the gateway through an Apollo client; a spec
// that imports this drives its `shortLink` query and `shortLinkUpdate`
// mutation through these mocks. Assert on `mockApolloClient` rather than an
// `@apollo/client` import, which the spec may load before this mock is set.
export const mockQuery = vi.fn()
export const mockMutate = vi.fn()
export const mockApolloClient = vi.fn(function () {
  return { query: mockQuery, mutate: mockMutate }
})

vi.mock('@apollo/client', () => ({
  ApolloClient: mockApolloClient,
  InMemoryCache: vi.fn(),
  HttpLink: vi.fn()
}))

/** A journey QR code row pointing at `journeyId`. */
export function qrCodeRow(overrides: Record<string, unknown> = {}): never {
  return {
    id: 'qrCodeId',
    teamId: 'teamId',
    journeyId: 'journeyId',
    toJourneyId: 'journeyId',
    toBlockId: null,
    shortLinkId: 'shortLinkId',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    ...overrides
  } as never
}

/** The journey row `getTo` reads, with its team's custom domains. */
export function journeyRow(
  overrides: {
    id?: string
    slug?: string
    customDomains?: Array<{ name: string; routeAllTeamJourneys: boolean }>
  } = {}
): never {
  return {
    id: overrides.id ?? 'journeyId',
    slug: overrides.slug ?? 'my-journey',
    teamId: 'teamId',
    team: { id: 'teamId', customDomains: overrides.customDomains ?? [] },
    journeyCollectionJourneys: []
  } as never
}
