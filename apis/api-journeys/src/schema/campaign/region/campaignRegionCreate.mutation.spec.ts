import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignRegionCreate', () => {
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

    const result = await create('clientId')

    expect(result.data.campaignRegionCreate).toMatchObject({
      id: 'clientId',
      slug: 'new-region-3',
      order: 2
    })
    expect(prismaMock.campaignRegion.findMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaignId', slug: { startsWith: 'new-region' } },
      select: { slug: true }
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
