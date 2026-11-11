import { mockQueueAdd } from '../../../../test/bullmqMock'
import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSetup'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { campaignRegionLanguageWithAcl } from '../../../../test/campaignRegionFactory'
import {
  CampaignWriteCall,
  fakeCampaignWrite
} from '../../../../test/campaignWrite'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { deleteShortLink } from '../../qrCode/qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../campaignWrite', () => ({ campaignWrite: vi.fn() }))

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
  let writes: CampaignWriteCall[]

  beforeEach(() => {
    setupCampaignBlockSpec()
    writes = fakeCampaignWrite(prismaMock)
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
    // The row re-read under the lock is unlinked with no QR code unless a
    // test says so.
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: null,
      qrCode: null
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

  async function remove(
    id = 'eurRegionId-529'
  ): Promise<CampaignSpecResult<typeof DELETE>> {
    return await authClient({ document: DELETE, variables: { id } })
  }

  it('deletes an unlinked share language with no QR code and renumbers the rest contiguously', async () => {
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
    expect(prismaMock.campaignRegionLanguage.count).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
    expect(writes).toEqual([
      {
        campaignId: 'campaignId',
        declaration: { structure: true, shareLanguage: 'eurRegionId-529' },
        jobs: [],
        touched: true
      }
    ])
  })

  it('declares the structure lock and the share language row', async () => {
    await remove()

    expect(writes.map(({ declaration }) => declaration)).toEqual([
      { structure: true, shareLanguage: 'eurRegionId-529' }
    ])
  })

  it('re-reads the row in the write before it deletes it', async () => {
    await remove()

    const order = (mock: unknown): number =>
      vi.mocked(mock as () => void).mock.invocationCallOrder[0]
    expect(
      prismaMock.campaignRegionLanguage.findUniqueOrThrow
    ).toHaveBeenCalledWith({
      where: { id: 'eurRegionId-529' },
      select: {
        journeyId: true,
        qrCode: { select: { id: true, shortLinkId: true } }
      }
    })
    // Not lock order: the link as re-read decides whether the delete runs.
    expect(
      order(prismaMock.campaignRegionLanguage.findUniqueOrThrow)
    ).toBeLessThan(order(prismaMock.campaignRegionLanguage.delete))
  })

  it('deletes a language unlinked with its QR code kept, the QR row in the write and its short link after commit', async () => {
    // The reported path: linked (which mints the QR code), then unlinked,
    // which keeps it; the row reaches delete unlinked but holding the code.
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: null,
      qrCode: { id: 'qrCodeId', shortLinkId: 'shortLinkId' }
    } as never)
    prismaMock.campaignRegionLanguage.count.mockResolvedValue(0)

    const result = await remove()

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignRegionLanguage.delete).toHaveBeenCalledWith({
      where: { id: 'eurRegionId-529' }
    })
    expect(prismaMock.campaignRegionLanguage.count).toHaveBeenCalledWith({
      where: { qrCodeId: 'qrCodeId' }
    })
    expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['qrCodeId'] } }
    })
    // The short link goes on the retried delete queue, not straight to the gateway.
    expect(
      mockQueueAdd.mock.calls
        .filter(([name]) => name === 'api-journeys-shortlink-delete-job')
        .map(([, data]) => data.shortLinkId)
    ).toEqual(['shortLinkId'])
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(writes).toEqual([
      {
        campaignId: 'campaignId',
        declaration: { structure: true, shareLanguage: 'eurRegionId-529' },
        jobs: [expect.any(Function)],
        touched: true
      }
    ])
  })

  it('deletes only its own QR code, leaving the journey and its other rows alone', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: null,
      qrCode: { id: 'qrCodeId', shortLinkId: 'shortLinkId' }
    } as never)
    prismaMock.campaignRegionLanguage.count.mockResolvedValue(0)

    await remove()

    expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.qrCode.delete).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionLanguage.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionLanguage.delete).toHaveBeenCalledTimes(1)
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
    expect(prismaMock.journey.delete).not.toHaveBeenCalled()
  })

  it('keeps a QR code another share language still holds, queueing no short link delete', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: null,
      qrCode: { id: 'qrCodeId', shortLinkId: 'shortLinkId' }
    } as never)
    prismaMock.campaignRegionLanguage.count.mockResolvedValue(1)

    const result = await remove()

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignRegionLanguage.delete).toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
    expect(writes[0].jobs).toEqual([])
  })

  it('rolls back with nothing queued when the QR row cannot be deleted', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: null,
      qrCode: { id: 'qrCodeId', shortLinkId: 'shortLinkId' }
    } as never)
    prismaMock.campaignRegionLanguage.count.mockResolvedValue(0)
    prismaMock.qrCode.deleteMany.mockRejectedValue(new Error('db down'))

    const result = await remove()

    expect(result.errors).toBeDefined()
    expect(mockQueueAdd).not.toHaveBeenCalled()
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(writes[0].jobs).toEqual([])
  })

  it('deletes the short link directly when the delete queue is unreachable', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: null,
      qrCode: { id: 'qrCodeId', shortLinkId: 'shortLinkId' }
    } as never)
    prismaMock.campaignRegionLanguage.count.mockResolvedValue(0)
    mockQueueAdd.mockRejectedValueOnce(new Error('redis down'))

    const result = await remove()

    expect(result.errors).toBeUndefined()
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkId')
  })

  it('refuses a language still linked to a journey, deleting nothing', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', FRENCH, {
        qrCodeId: 'qrCodeId'
      })
    )
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: 'journeyId',
      qrCode: { id: 'qrCodeId', shortLinkId: 'shortLinkId' }
    } as never)

    const result = await remove(`eurRegionId-${FRENCH}`)

    expect(result.errors?.[0].message).toBe(
      'Unlink the journey before removing this language.'
    )
    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignRegionLanguage.delete).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('refuses a language a concurrent link linked after it was authorised', async () => {
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockResolvedValue({
      journeyId: 'journeyId',
      qrCode: { id: 'qrCodeId', shortLinkId: 'shortLinkId' }
    } as never)

    const result = await remove()

    expect(result.errors?.[0].extensions).toMatchObject({
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

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignRegionLanguage.delete).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown row', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(null)

    const result = await remove('missing')

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
