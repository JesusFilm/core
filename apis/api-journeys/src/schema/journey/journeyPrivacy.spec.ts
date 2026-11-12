import { parse } from 'graphql'
import { vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import type { Journey } from './journey.acl'

vi.mock('@core/yoga/firebaseClient', () => ({ getUserFromPayload: vi.fn() }))

const owner = {
  id: 'owner',
  email: 'owner@example.com',
  firstName: 'Owner',
  emailVerified: true
}
const stranger = {
  id: 'stranger',
  email: 'stranger@example.com',
  firstName: 'Stranger',
  emailVerified: true
}
const draft = {
  id: 'private-id',
  slug: 'private-slug',
  title: 'PRIVATE SENTINEL',
  description: 'PRIVATE DESCRIPTION',
  status: 'draft',
  template: false,
  publishedAt: null,
  deletedAt: null,
  teamId: 'team',
  userJourneys: [{ userId: owner.id, role: 'owner' }],
  team: { id: 'team', userTeams: [] },
  blocks: []
} as unknown as Journey
const client = getClient()

async function read(source: string, variables: Record<string, unknown> = {}) {
  return client({ document: parse(source), variables })
}

describe('journey privacy', () => {
  beforeEach(() => {
    vi.mocked(getUserFromPayload).mockReturnValue(null)
    prismaMock.journey.findUnique.mockResolvedValue(draft)
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue(draft)
    prismaMock.block.findMany.mockResolvedValue([])
  })

  describe('private journey HTTP reads', () => {
    it.each([null, stranger, owner])(
      'public root never serves a draft to %j',
      async (user) => {
        vi.mocked(getUserFromPayload).mockReturnValue(user)
        for (const options of [
          '',
          ', options: { status: [] }',
          ', options: { status: [draft, published] }'
        ]) {
          for (const [id, idType] of [
            ['private-id', 'databaseId'],
            ['private-slug', 'slug']
          ]) {
            const result = await read(
              `query { journey(id: "${id}", idType: ${idType}${options}) { id title blocks { id } } }`
            )
            expect(result).toMatchObject({
              errors: [
                expect.objectContaining({ message: 'journey not found' })
              ]
            })
            expect(JSON.stringify(result)).not.toContain('PRIVATE SENTINEL')
          }
        }
      }
    )

    it.each([null, stranger])(
      'entity hydration denies a private draft to %j',
      async (user) => {
        vi.mocked(getUserFromPayload).mockReturnValue(user)
        const result = await read(
          `query { _entities(representations: [{__typename: "Journey", id: "private-id"}]) { ... on Journey { id title blocks { id } } } }`
        )
        expect(JSON.stringify(result)).not.toContain('PRIVATE SENTINEL')
        expect(result).toHaveProperty('errors')
      }
    )

    it.each([null, stranger])(
      'simple read denies a private draft to %j',
      async (user) => {
        vi.mocked(getUserFromPayload).mockReturnValue(user)
        const result = await read(
          `query { journeySimpleGet(id: "private-id") }`
        )
        expect(JSON.stringify(result)).not.toContain('PRIVATE SENTINEL')
        expect(result).toHaveProperty('errors')
      }
    )

    it('keeps the authorized Admin read available for private playback', async () => {
      vi.mocked(getUserFromPayload).mockReturnValue(owner)
      const result = await read(
        `query { adminJourney(id: "private-id", idType: databaseId) { id title status } }`
      )
      expect(result).toMatchObject({
        data: {
          adminJourney: {
            id: 'private-id',
            title: 'PRIVATE SENTINEL',
            status: 'draft'
          }
        }
      })
      expect(result).not.toHaveProperty('errors')
    })

    it('keeps anonymous published playback available', async () => {
      prismaMock.journey.findUnique.mockResolvedValue({
        ...draft,
        status: 'published',
        publishedAt: new Date()
      })
      const result = await read(
        `query { journey(id: "private-slug") { title status } }`
      )
      expect(result).toMatchObject({
        data: { journey: { title: 'PRIVATE SENTINEL', status: 'published' } }
      })
      expect(result).not.toHaveProperty('errors')
    })
  })

  describe('never-published lifecycle HTTP transitions', () => {
    it.each(['archived', 'trashed', 'deleted'])(
      'restore of a never-published %s returns a private draft',
      async (status) => {
        vi.mocked(getUserFromPayload).mockReturnValue(owner)
        const inactive = { ...draft, status } as Journey
        prismaMock.journey.findMany.mockResolvedValue([inactive])
        prismaMock.journey.findUnique.mockResolvedValue(inactive)
        prismaMock.journey.update.mockImplementation(({ data }) => {
          const updated = { ...inactive, ...data } as Journey
          prismaMock.journey.findUnique.mockResolvedValue(updated)
          return Promise.resolve(updated) as unknown as ReturnType<
            typeof prismaMock.journey.update
          >
        })
        const result = await read(
          `mutation { journeysRestore(ids: ["private-id"]) { id status publishedAt } }`
        )
        expect(result).toMatchObject({
          data: {
            journeysRestore: [
              { id: 'private-id', status: 'draft', publishedAt: null }
            ]
          }
        })
        expect(result).not.toHaveProperty('errors')
        const publicRead = await read(
          `query { journey(id: "private-slug") { title } }`
        )
        expect(JSON.stringify(publicRead)).not.toContain('PRIVATE SENTINEL')
      }
    )
  })

  it('preserves publisher reads of draft templates without granting ordinary drafts', async () => {
    vi.mocked(getUserFromPayload).mockReturnValue(stranger)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'role',
      userId: stranger.id,
      roles: ['publisher']
    })
    const template: Journey = { ...draft, template: true, userJourneys: [] }
    prismaMock.journey.findUnique.mockResolvedValue(template)
    prismaMock.journey.findMany.mockResolvedValue([template])
    const result = await read(
      'query { adminJourneys(template: true, allAccessible: true) { title blocks { id } } }'
    )
    expect(JSON.stringify(result)).toContain('PRIVATE SENTINEL')
    expect(result).not.toHaveProperty('errors')

    prismaMock.journey.findUnique.mockResolvedValue({
      ...template,
      template: false
    })
    const ordinary = await read('query { journeySimpleGet(id: "private-id") }')
    expect(JSON.stringify(ordinary)).not.toContain('PRIVATE SENTINEL')
  })

  it('protects authored theme data without requiring a nested Journey selection', async () => {
    prismaMock.journeyTheme.findUnique.mockResolvedValue({
      id: 'theme',
      journeyId: draft.id,
      userId: owner.id,
      headerFont: 'PRIVATE FONT SENTINEL',
      bodyFont: null,
      labelFont: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const source =
      'query { journeyTheme(journeyId: "private-id") { headerFont userId } }'
    vi.mocked(getUserFromPayload).mockReturnValue(owner)
    expect(JSON.stringify(await read(source))).toContain(
      'PRIVATE FONT SENTINEL'
    )
    vi.mocked(getUserFromPayload).mockReturnValue(stranger)
    const result = await read(source)
    expect(JSON.stringify(result)).not.toContain('PRIVATE FONT SENTINEL')
    expect(result).toHaveProperty('errors')
  })
})
