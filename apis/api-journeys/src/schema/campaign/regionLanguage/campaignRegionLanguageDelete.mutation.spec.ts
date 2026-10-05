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
import { deleteShortLink } from '../../qrCode/qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../qrCode/qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../qrCode/qrCode.service')>()),
  deleteShortLink: vi.fn()
}))

const FRENCH = '496'

describe('campaignRegionLanguageDelete', () => {
  const DELETE = graphql(`
    mutation CampaignRegionLanguageDelete($id: ID!) {
      campaignRegionLanguageDelete(id: $id) {
        id
        languageId
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory()
      .withRegion('EUR')
      .withLinkedJourney('eurRegionId', FRENCH, {
        id: 'journeyId',
        title: 'Noël',
        description: null
      })
      .build()
    const [english, french] = fixture.regions[0].languages
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529')
    )
    prismaMock.campaignRegionLanguage.delete.mockResolvedValue(english)
    prismaMock.campaignRegionLanguage.findMany.mockResolvedValue([french])
    prismaMock.campaignRegionLanguage.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...fixture.regions[0].languages.find((row) => row.id === where.id),
      ...data
    })) as never)
  })

  async function remove(id = 'eurRegionId-529'): Promise<any> {
    return await authClient({ document: DELETE, variables: { id } })
  }

  it('deletes an unlinked share language and renumbers the rest contiguously', async () => {
    const result = await remove()

    expect(result).toEqual({
      data: {
        campaignRegionLanguageDelete: {
          id: 'eurRegionId-529',
          languageId: '529'
        }
      }
    })
    expect(prismaMock.campaignRegionLanguage.delete).toHaveBeenCalledWith({
      where: { id: 'eurRegionId-529' }
    })
    expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith({
      where: { id: `eurRegionId-${FRENCH}` },
      data: { order: 0 }
    })
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it("deletes a linked language's QR code and short link as qrCodeDelete does, leaving the journey untouched", async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', FRENCH, {
        qrCode: {
          id: 'qrCodeId',
          teamId: 'teamId',
          journeyId: 'journeyId',
          toJourneyId: 'journeyId',
          toBlockId: null,
          shortLinkId: 'shortLinkId',
          color: '#000000',
          backgroundColor: '#FFFFFF'
        }
      })
    )
    prismaMock.campaignRegionLanguage.delete.mockResolvedValue(
      fixture.regions[0].languages[1]
    )

    const result = await remove(`eurRegionId-${FRENCH}`)

    expect(result.errors).toBeUndefined()
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkId')
    expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['qrCodeId'] } }
    })
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
    expect(prismaMock.journey.delete).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId',
        '529'
      )
    )

    const result = await remove()

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegionLanguage.delete).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown row', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(null)

    const result = await remove('missing')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
