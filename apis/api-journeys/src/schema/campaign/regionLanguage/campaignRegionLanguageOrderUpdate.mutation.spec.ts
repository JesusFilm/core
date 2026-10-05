import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { campaignRegionLanguageWithAcl } from '../../../../test/campaignRegionFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const FRENCH = '496'
const SPANISH = '21028'

describe('campaignRegionLanguageOrderUpdate', () => {
  const ORDER_UPDATE = graphql(`
    mutation CampaignRegionLanguageOrderUpdate($id: ID!, $order: Int!) {
      campaignRegionLanguageOrderUpdate(id: $id, order: $order) {
        id
        languageId
        order
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory()
      .withRegion('EUR')
      .withLinkedJourney('eurRegionId', FRENCH, {
        id: 'frJourneyId',
        title: 'Noël',
        description: null
      })
      .withLinkedJourney('eurRegionId', SPANISH, {
        id: 'esJourneyId',
        title: 'Navidad',
        description: null
      })
      .build()
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', SPANISH)
    )
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue(
      fixture.regions[0].languages
    )
    prismaMock.campaignRegionLanguage.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...fixture.regions[0].languages.find((row) => row.id === where.id),
      ...data
    })) as never)
  })

  async function move(
    order: number,
    id = `eurRegionId-${SPANISH}`
  ): Promise<any> {
    return await authClient({
      document: ORDER_UPDATE,
      variables: { id, order }
    })
  }

  it('moves the language to the given order and renumbers contiguously', async () => {
    const result = await move(0)

    expect(result.data.campaignRegionLanguageOrderUpdate).toEqual([
      { id: `eurRegionId-${SPANISH}`, languageId: SPANISH, order: 0 },
      { id: 'eurRegionId-529', languageId: '529', order: 1 },
      { id: `eurRegionId-${FRENCH}`, languageId: FRENCH, order: 2 }
    ])
    expect(prismaMock.campaignRegionLanguage.findMany).toHaveBeenCalledWith({
      where: { regionId: 'eurRegionId' },
      orderBy: { order: 'asc' }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('clamps a position past the end to last', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529')
    )

    const result = await move(99, 'eurRegionId-529')

    expect(
      result.data.campaignRegionLanguageOrderUpdate.map(
        (row: any) => row.languageId
      )
    ).toEqual([FRENCH, SPANISH, '529'])
  })

  it('rejects a negative order (BAD_USER_INPUT, field order)', async () => {
    const result = await move(-1)

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'order'
    })
    expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId',
        '529'
      )
    )

    const result = await move(0, 'eurRegionId-529')

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })
})
