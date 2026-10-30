import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSetup'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { campaignRegionWithAcl } from '../../../../test/campaignRegionFactory'
import {
  CampaignWriteCall,
  fakeCampaignWrite
} from '../../../../test/campaignWrite'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { fetchLanguage } from '../gatewayClient'
import { REGION_SHARE_LANGUAGES_MAX } from '../validation'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../campaignWrite', () => ({ campaignWrite: vi.fn() }))

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
  let writes: CampaignWriteCall[]

  beforeEach(() => {
    setupCampaignBlockSpec()
    writes = fakeCampaignWrite(prismaMock)
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

  async function create(
    languageId = FRENCH
  ): Promise<CampaignSpecResult<typeof CREATE>> {
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
    expect(writes).toEqual([
      {
        campaignId: 'campaignId',
        declaration: { structure: true },
        jobs: [],
        touched: true
      }
    ])
  })

  it('rejects a language api-languages does not know (BAD_USER_INPUT, field languageId)', async () => {
    vi.mocked(fetchLanguage).mockResolvedValue(null)

    const result = await create('999999')

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'languageId'
    })
    expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
  })

  it('rejects the same language twice on a region (BAD_USER_INPUT, field languageId)', async () => {
    const result = await create('529')

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'languageId'
    })
    expect(fetchLanguage).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
  })

  describe('inside the transaction', () => {
    function shareRows(languageIds: string[]) {
      return languageIds.map((languageId, order) => ({
        ...fixture.regions[0].languages[0],
        id: `eurLanguage-${languageId}`,
        languageId,
        order
      }))
    }

    function committedRows(languageIds: string[]): void {
      prismaMock.campaignRegionLanguage.findMany
        .mockResolvedValueOnce(fixture.regions[0].languages)
        .mockResolvedValueOnce(shareRows(languageIds))
    }

    it('re-reads the share languages under the structure lock, and appends after them', async () => {
      committedRows(['529', '21028'])

      const result = await create()

      expect(result.data.campaignRegionLanguageCreate.order).toBe(2)
      expect(writes.map(({ declaration }) => declaration)).toEqual([
        { structure: true }
      ])
      expect(prismaMock.campaignRegionLanguage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { regionId: 'eurRegionId', languageId: FRENCH, order: 2 }
        })
      )
    })

    it('rejects a language a concurrent add committed after the first read (BAD_USER_INPUT, not a 500)', async () => {
      committedRows(['529', FRENCH])

      const result = await create()

      expect(result.errors?.[0]).toMatchObject({
        message: `languageId ${FRENCH} is already a share language of this region`,
        extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
      })
      expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
    })

    it(`refuses a share language past ${REGION_SHARE_LANGUAGES_MAX} (BAD_USER_INPUT, field languageId)`, async () => {
      committedRows(
        Array.from({ length: REGION_SHARE_LANGUAGES_MAX }, (_, index) =>
          String(index + 1)
        )
      )

      const result = await create()

      expect(result.errors?.[0]).toMatchObject({
        message: `a region has at most ${REGION_SHARE_LANGUAGES_MAX} share languages`,
        extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
      })
      expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
    })

    it(`allows the ${REGION_SHARE_LANGUAGES_MAX}th share language`, async () => {
      committedRows(
        Array.from({ length: REGION_SHARE_LANGUAGES_MAX - 1 }, (_, index) =>
          String(index + 1)
        )
      )

      const result = await create()

      expect(result.data.campaignRegionLanguageCreate.order).toBe(
        REGION_SHARE_LANGUAGES_MAX - 1
      )
    })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId'
      )
    )

    const result = await create()

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegionLanguage.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown region', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(null)

    const result = await create()

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
