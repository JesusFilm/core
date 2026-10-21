import { useResponseCache } from '@graphql-yoga/plugin-response-cache'

import './yoga'

vi.mock('@graphql-yoga/plugin-response-cache', () => ({
  createInMemoryCache: vi.fn(() => ({})),
  useResponseCache: vi.fn(() => ({}))
}))

// The response cache is only installed outside NODE_ENV=test, so load the
// server as production would to see the plugin's configuration. Hoisted so it
// runs before the `./yoga` import above.
vi.hoisted(() => vi.stubEnv('NODE_ENV', 'production'))

describe('yoga response cache', () => {
  const ttlPerSchemaCoordinate =
    vi.mocked(useResponseCache).mock.calls[0]?.[0].ttlPerSchemaCoordinate ?? {}

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('installs the response cache once', () => {
    expect(useResponseCache).toHaveBeenCalledTimes(1)
  })

  it('never caches the campaign reads', () => {
    // `campaigns` and `campaign` are team-ACL'd: with the default TTL a fresh
    // team's first empty list would be cached forever and served to everyone.
    expect(ttlPerSchemaCoordinate).toMatchObject({
      'Query.campaign': 0,
      'Query.campaignPublic': 0,
      'Query.campaignTranslations': 0,
      'Query.campaigns': 0
    })
  })

  it('leaves campaignStats to its own cache', () => {
    expect(ttlPerSchemaCoordinate).not.toHaveProperty('Query.campaignStats')
  })
})
