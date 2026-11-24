import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

import { useResponseCache } from '@graphql-yoga/plugin-response-cache'

import './yoga'

const CAMPAIGN_SCHEMA_ROOT = join(__dirname, 'schema/campaign')

/** `Query.<name>` for every `builder.queryField('<name>', …)` under `schema/campaign`. */
const campaignQueryCoordinates = readdirSync(CAMPAIGN_SCHEMA_ROOT, {
  recursive: true,
  encoding: 'utf8'
})
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
  .flatMap((file) =>
    [
      ...readFileSync(join(CAMPAIGN_SCHEMA_ROOT, file), 'utf8').matchAll(
        /builder\.queryField\(\s*'(\w+)'/g
      )
    ].map(([, name]) => `Query.${name}`)
  )
  .sort()

vi.mock('@graphql-yoga/plugin-response-cache', () => ({
  createInMemoryCache: vi.fn(() => ({})),
  useResponseCache: vi.fn(() => ({}))
}))

// The response cache is only installed outside NODE_ENV=test, so load the
// server as production would to see the plugin's configuration. Hoisted so it
// runs before the `./yoga` import above. This is the one spec whose module
// graph loads with production env, so any production-only side effect added
// to `yoga.ts` runs here first; it stays contained to this file only because
// the vitest `forks` pool runs every spec file in its own process.
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
    // `campaignStats` gates a draft campaign on the caller. The list is read
    // from the source, so a new campaign query without a TTL of 0 fails here.
    expect(campaignQueryCoordinates).toEqual(
      expect.arrayContaining([
        'Query.campaign',
        'Query.campaignPublic',
        'Query.campaignStats',
        'Query.campaignTranslations',
        'Query.campaigns'
      ])
    )
    for (const coordinate of campaignQueryCoordinates)
      expect(ttlPerSchemaCoordinate).toHaveProperty([coordinate], 0)
  })

  it("never caches a Campaign's Plausible token", () => {
    // The shared-link token opens the Campaign Report's dashboard; any
    // response carrying it must come from the resolver's campaign Read.
    expect(ttlPerSchemaCoordinate).toHaveProperty(
      ['Campaign.plausibleToken'],
      0
    )
  })
})
