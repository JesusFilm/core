import { mockQueueAdd } from '../../../../test/bullmqMock'
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
        title: 'Campagne',
        description: null
      })
      .build()
    const [english, french] = fixture.regions[0].languages
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529')
    )
    // The row re-read under the lock has no QR code unless a test says so.
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      qrCodeId: null
    } as never)
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
    expect(mockQueueAdd).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('takes the row lock before any read or delete in the transaction', async () => {
    await remove()

    const order = (mock: unknown): number =>
      vi.mocked(mock as () => void).mock.invocationCallOrder[0]
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
    expect(order(prismaMock.$queryRaw)).toBeLessThan(
      order(prismaMock.campaignRegionLanguage.findUniqueOrThrow)
    )
    expect(
      prismaMock.campaignRegionLanguage.findUniqueOrThrow
    ).toHaveBeenCalledWith({
      where: { id: 'eurRegionId-529' },
      select: { qrCodeId: true }
    })
    expect(
      order(prismaMock.campaignRegionLanguage.findUniqueOrThrow)
    ).toBeLessThan(order(prismaMock.campaignRegionLanguage.delete))
  })

  it('refuses a language holding a QR code, deleting nothing', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', FRENCH, {
        qrCodeId: 'qrCodeId'
      })
    )
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      qrCodeId: 'qrCodeId'
    } as never)

    const result = await remove(`eurRegionId-${FRENCH}`)

    expect(result.errors[0].message).toBe(
      'This language has a QR code. Unlink it instead.'
    )
    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignRegionLanguage.delete).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('refuses a language a concurrent link gave a QR code after it was authorised', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      qrCodeId: 'qrCodeId'
    } as never)

    const result = await remove()

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignRegionLanguage.delete).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
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
