import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import {
  UNIQUE_VIOLATION_SHAPES,
  uniqueViolation
} from '../../../../test/uniqueViolation'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { CAMPAIGN_REGIONS_MAX } from '../validation'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignRegionCreate', () => {
  const CLIENT_ID = '0b8f3e5c-6d2a-4f1e-9c7b-3a5d8e2f1c40'

  const CREATE = graphql(`
    mutation CampaignRegionCreate($campaignId: ID!, $id: ID) {
      campaignRegionCreate(campaignId: $campaignId, id: $id) {
        id
        campaignId
        name
        slug
        order
        listed
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    prismaMock.campaignRegion.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.campaignRegion.count.mockResolvedValue(0)
    prismaMock.campaignRegion.create.mockImplementation((async ({
      data
    }: any) => ({
      ...campaignFactory().withRegion('New region').build().regions[0],
      ...data,
      id: data.id ?? 'newRegionId',
      languages: undefined
    })) as never)
  })

  async function create(id?: string): Promise<any> {
    return await authClient({
      document: CREATE,
      variables: { campaignId: 'campaignId', id }
    })
  }

  it('seeds "New region", a derived slug, order last, listed, and one unlinked default-language share row', async () => {
    const result = await create()

    expect(result).toEqual({
      data: {
        campaignRegionCreate: {
          id: 'newRegionId',
          campaignId: 'campaignId',
          name: 'New region',
          slug: 'new-region',
          order: 0,
          listed: true
        }
      }
    })
    expect(prismaMock.campaignRegion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          id: undefined,
          campaignId: 'campaignId',
          name: 'New region',
          slug: 'new-region',
          order: 0,
          listed: true,
          languages: {
            create: { languageId: fixture.defaultLanguageId, order: 0 }
          }
        }
      })
    )
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionCountry.create).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('suffixes the slug and appends the order after existing regions', async () => {
    prismaMock.campaignRegion.findMany.mockResolvedValue([
      { slug: 'new-region' },
      { slug: 'new-region-2' }
    ] as never)
    prismaMock.campaignRegion.count.mockResolvedValue(2)

    const result = await create(CLIENT_ID)

    expect(result.data.campaignRegionCreate).toMatchObject({
      id: CLIENT_ID,
      slug: 'new-region-3',
      order: 2
    })
    expect(prismaMock.campaignRegion.findMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaignId', slug: { startsWith: 'new-region' } },
      select: { slug: true }
    })
  })

  it('skips a slug a live journey of the team already has', async () => {
    prismaMock.journey.findMany.mockResolvedValue([
      { slug: 'new-region' }
    ] as never)

    const result = await create()

    expect(result.data.campaignRegionCreate.slug).toBe('new-region-2')
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: {
        teamId: fixture.teamId,
        slug: { startsWith: 'new-region' },
        deletedAt: null
      },
      select: { slug: true }
    })
  })

  it('takes the structure lock before it counts the regions for the order', async () => {
    prismaMock.campaignRegion.count.mockResolvedValue(3)

    const result = await create()

    expect(result.data.campaignRegionCreate.order).toBe(3)
    const lock = prismaMock.$queryRaw.mock.calls[0]
    expect((lock[0] as unknown as string[]).join('?')).toContain(
      'pg_advisory_xact_lock(hashtext('
    )
    expect(lock[1]).toBe('campaign:campaignId')
    expect(prismaMock.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.campaignRegion.count.mock.invocationCallOrder[0]
    )
    expect(prismaMock.campaignRegion.count).toHaveBeenCalledWith({
      where: { campaignId: 'campaignId' }
    })
  })

  it(`refuses a region past ${CAMPAIGN_REGIONS_MAX} (BAD_USER_INPUT)`, async () => {
    prismaMock.campaignRegion.count.mockResolvedValue(CAMPAIGN_REGIONS_MAX)

    const result = await create()

    expect(result.errors[0]).toMatchObject({
      message: `a campaign has at most ${CAMPAIGN_REGIONS_MAX} regions`,
      extensions: { code: 'BAD_USER_INPUT', field: 'campaignId' }
    })
    expect(prismaMock.campaignRegion.create).not.toHaveBeenCalled()
  })

  it(`allows the ${CAMPAIGN_REGIONS_MAX}th region`, async () => {
    prismaMock.campaignRegion.count.mockResolvedValue(CAMPAIGN_REGIONS_MAX - 1)

    const result = await create()

    expect(result.data.campaignRegionCreate.order).toBe(
      CAMPAIGN_REGIONS_MAX - 1
    )
  })

  it.each(['', 'not-a-uuid'])(
    'refuses a client id that is not a UUID (%j) (BAD_USER_INPUT)',
    async (id) => {
      const result = await create(id)

      expect(result.errors[0]).toMatchObject({
        message: 'id must be a UUID',
        extensions: { code: 'BAD_USER_INPUT', field: 'id' }
      })
      expect(prismaMock.campaignRegion.create).not.toHaveBeenCalled()
    }
  )

  describe.each(UNIQUE_VIOLATION_SHAPES)('unique violation (%s)', (shape) => {
    it('returns the existing region of the same campaign when the id is already taken', async () => {
      prismaMock.campaignRegion.create.mockRejectedValue(
        uniqueViolation(shape, ['id'])
      )
      prismaMock.campaignRegion.findUnique.mockResolvedValue({
        ...campaignFactory().withRegion('New region').build().regions[0],
        id: CLIENT_ID,
        campaignId: 'campaignId'
      })

      const result = await create(CLIENT_ID)

      expect(result.data.campaignRegionCreate).toMatchObject({
        id: CLIENT_ID,
        campaignId: 'campaignId'
      })
    })

    it('answers CONFLICT (field id) when the id belongs to another campaign', async () => {
      prismaMock.campaignRegion.create.mockRejectedValue(
        uniqueViolation(shape, ['id'])
      )
      prismaMock.campaignRegion.findUnique.mockResolvedValue({
        id: CLIENT_ID,
        campaignId: 'otherCampaignId'
      } as never)

      const result = await create(CLIENT_ID)

      expect(result.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'id'
      })
    })

    it('answers CONFLICT (field slug) when the derived slug raced', async () => {
      prismaMock.campaignRegion.create.mockRejectedValue(
        uniqueViolation(shape, ['campaignId', 'slug'])
      )

      const withoutId = await create()
      const withId = await create(CLIENT_ID)

      expect(withoutId.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'slug'
      })
      expect(withId.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'slug'
      })
      expect(prismaMock.campaignRegion.findUnique).not.toHaveBeenCalled()
    })

    it('rethrows a unique violation on another column', async () => {
      prismaMock.campaignRegion.create.mockRejectedValue(
        uniqueViolation(shape, ['regionId', 'languageId'])
      )

      const result = await create(CLIENT_ID)

      expect(result.errors[0].extensions).toEqual({})
      expect(prismaMock.campaignRegion.findUnique).not.toHaveBeenCalled()
    })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await create()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegion.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await create()

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
