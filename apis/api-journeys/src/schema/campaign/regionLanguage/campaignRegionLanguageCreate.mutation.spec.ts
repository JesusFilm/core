import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { campaignRegionWithAcl } from '../../../../test/campaignRegionFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { fetchLanguage } from '../gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../gatewayClient', () => ({
  fetchLanguage: vi.fn()
}))

const FRENCH = '496'

describe('campaignRegionLanguageCreate', () => {
  const CREATE = graphql(`
    mutation CampaignRegionLanguageCreate($regionId: ID!, $languageId: ID!) {
      campaignRegionLanguageCreate(
        regionId: $regionId
        languageId: $languageId
      ) {
        id
        regionId
        languageId
        journeyId
        title
        description
        qrCodeId
        order
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory().withRegion('EUR').build()
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(fixture, 'eurRegionId')
    )
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue(
      fixture.regions[0].languages
    )
    prismaMock.campaignRegionLanguage.create.mockImplementation((async ({
      data
    }: any) => ({
      id: 'newRegionLanguageId',
      journeyId: null,
      title: null,
      description: null,
      qrCodeId: null,
      ...data
    })) as never)
    vi.mocked(fetchLanguage).mockResolvedValue({ id: FRENCH, bcp47: 'fr' })
  })

  async function create(languageId = FRENCH): Promise<any> {
    return await authClient({
      document: CREATE,
      variables: { regionId: 'eurRegionId', languageId }
    })
  }

  it('appends an unlinked share language for an api-languages language that need not be a campaign language', async () => {
    const result = await create()

    expect(result).toEqual({
      data: {
        campaignRegionLanguageCreate: {
          id: 'newRegionLanguageId',
          regionId: 'eurRegionId',
          languageId: FRENCH,
          journeyId: null,
          title: null,
          description: null,
          qrCodeId: null,
          order: 1
        }
      }
    })
    expect(fixture.languages.map((l) => l.languageId)).not.toContain(FRENCH)
    expect(fetchLanguage).toHaveBeenCalledWith(FRENCH)
    expect(prismaMock.campaignRegionLanguage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { regionId: 'eurRegionId', languageId: FRENCH, order: 1 }
      })
    )
    expect(prismaMock.qrCode.create).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('rejects a language api-languages does not know (BAD_USER_INPUT, field languageId)', async () => {
    vi.mocked(fetchLanguage).mockResolvedValue(null)

    const result = await create('999999')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'languageId'
    })
    expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
  })

  it('rejects the same language twice on a region (BAD_USER_INPUT, field languageId)', async () => {
    const result = await create('529')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'languageId'
    })
    expect(fetchLanguage).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId'
      )
    )

    const result = await create()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown region', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(null)

    const result = await create()

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
