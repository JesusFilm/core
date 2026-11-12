import { parse } from 'graphql'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import type { Journey } from './journey.acl'

vi.hoisted(() => vi.stubEnv('NODE_ENV', 'production'))
vi.mock('@core/yoga/firebaseClient', () => ({ getUserFromPayload: vi.fn() }))
// Synthetic identities enter at the owning-service boundary. Gateway signature
// verification is covered by the gateway, not replaced in production.
vi.mock('@graphql-hive/gateway', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql-hive/gateway')>()),
  useHmacSignatureValidation: () => ({})
}))

const owner = {
  id: 'owner',
  email: 'owner@example.com',
  firstName: 'Owner',
  emailVerified: true
}
const stranger = { ...owner, id: 'stranger' }
const draft = {
  id: 'private-id',
  title: 'PRIVATE CACHE SENTINEL',
  description: null,
  slug: 'private-slug',
  status: 'draft',
  firstPublishedAt: null,
  template: false,
  teamId: 'team',
  blocks: [],
  userJourneys: [{ userId: owner.id, role: 'owner' }],
  team: { userTeams: [] }
} as unknown as Journey
const client = getClient()

describe('private journey response caches', () => {
  afterAll(() => vi.unstubAllEnvs())

  beforeEach(() => {
    prismaMock.journey.findUnique.mockResolvedValue(draft)
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue(draft)
    prismaMock.block.findMany.mockResolvedValue([])
  })

  it.each([
    'query { adminJourney(id: "private-id", idType: databaseId) { title } }',
    'query { journeySimpleGet(id: "private-id") }',
    'query { _entities(representations: [{__typename: "Journey", id: "private-id"}]) { ... on Journey { title } } }'
  ])(
    'does not release an authorized warmed response to another caller: %s',
    async (source) => {
      const document = parse(source)
      vi.mocked(getUserFromPayload).mockReturnValue(owner)
      expect(JSON.stringify(await client({ document }))).toContain(
        'PRIVATE CACHE SENTINEL'
      )

      for (const user of [
        stranger,
        null,
        { ...stranger, id: 'other-stranger' }
      ]) {
        vi.mocked(getUserFromPayload).mockReturnValue(user)
        const response = await client({ document })
        expect(JSON.stringify(response)).not.toContain('PRIVATE CACHE SENTINEL')
        expect(response).toHaveProperty('errors')
      }

      // A role loss must also affect the same identity and the same query.
      vi.mocked(getUserFromPayload).mockReturnValue(owner)
      const inaccessible: Journey = { ...draft, userJourneys: [] }
      prismaMock.journey.findUnique.mockResolvedValue(inaccessible)
      expect(JSON.stringify(await client({ document }))).not.toContain(
        'PRIVATE CACHE SENTINEL'
      )
    }
  )
})
