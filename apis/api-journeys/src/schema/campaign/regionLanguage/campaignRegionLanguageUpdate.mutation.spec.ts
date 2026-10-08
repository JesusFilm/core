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
import {
  createShortLink,
  deleteShortLink,
  updateShortLink
} from '../../qrCode/qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../qrCode/qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../qrCode/qrCode.service')>()),
  createShortLink: vi.fn(),
  updateShortLink: vi.fn(),
  deleteShortLink: vi.fn(),
  getShortLinkDomain: vi.fn(() => 'short.example.org')
}))

const UTM = /\?utm_source=ns-qr-code&utm_campaign=[0-9a-f-]{36}$/

/** A live-published journey of another team, as the paste resolution reads it. */
function journeyRow(
  id: string,
  slug: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id,
    slug,
    title: `${slug} title`,
    description: `${slug} description`,
    status: 'published',
    deletedAt: null,
    teamId: 'otherTeamId',
    team: { id: 'otherTeamId', customDomains: [] },
    journeyCollectionJourneys: [],
    ...overrides
  }
}

const QR_CODE = {
  id: 'qrCodeId',
  teamId: 'teamId',
  journeyId: 'journeyId',
  toJourneyId: 'journeyId',
  toBlockId: null,
  shortLinkId: 'shortLinkId',
  color: '#000000',
  backgroundColor: '#FFFFFF'
}

describe('campaignRegionLanguageUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignRegionLanguageUpdate(
      $id: ID!
      $input: CampaignRegionLanguageUpdateInput!
    ) {
      campaignRegionLanguageUpdate(id: $id, input: $input) {
        id
        journeyId
        title
        description
        qrCodeId
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory().withRegion('EUR').build()
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529')
    )
    // The row re-read under the lock is the row authorised.
    prismaMock.campaignRegionLanguage.findUniqueOrThrow.mockImplementation(
      (async (args: any) =>
        await prismaMock.campaignRegionLanguage.findUnique(args)) as never
    )
    // The row as authorised, updated: the same row `findUnique` served.
    prismaMock.campaignRegionLanguage.update.mockImplementation((async ({
      where,
      data
    }: any) => {
      const loaded = (await prismaMock.campaignRegionLanguage.findUnique({
        where
      })) as any
      const { region: _region, qrCode: _qrCode, ...row } = loaded ?? {}
      return { ...fixture.regions[0].languages[0], ...row, ...data }
    }) as never)
    prismaMock.journey.findFirst.mockResolvedValue(
      journeyRow('journeyId', 'christmas-europe') as never
    )
    prismaMock.journey.findUniqueOrThrow.mockImplementation((async ({
      where
    }: any) =>
      journeyRow(
        where.id,
        where.id === 'journeyId' ? 'christmas-europe' : 'noel-europe'
      )) as never)
    prismaMock.qrCode.create.mockImplementation((async ({ data }: any) => ({
      ...QR_CODE,
      ...data
    })) as never)
    vi.mocked(createShortLink).mockImplementation(async ({ id }) => ({ id }))
  })

  function linked(toJourneyId = 'journeyId') {
    return campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529', {
      journeyId: toJourneyId,
      title: 'My title',
      description: 'My description',
      qrCodeId: 'qrCodeId',
      qrCode: { ...QR_CODE, journeyId: toJourneyId, toJourneyId }
    })
  }

  async function update(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'eurRegionId-529', input }
    })
  }

  describe('journey paste', () => {
    it('resolves an admin link by id, published only, with the routing filter skipped, and snapshots title and description', async () => {
      const result = await update({
        url: 'https://admin.nextstep.is/journeys/journeyId'
      })

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignRegionLanguageUpdate).toEqual({
        id: 'eurRegionId-529',
        journeyId: 'journeyId',
        title: 'christmas-europe title',
        description: 'christmas-europe description',
        qrCodeId: 'qrCodeId'
      })
      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'journeyId', status: 'published', deletedAt: null }
        })
      )
    })

    it('resolves a public URL on any domain by slug', async () => {
      await update({ url: 'https://journeys.example.org/christmas-europe' })

      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: 'christmas-europe',
            status: 'published',
            deletedAt: null
          }
        })
      )
    })

    it('rejects a journey that exists but is unpublished (BAD_USER_INPUT, field url, "Journey not found or not published")', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(null)

      const result = await update({
        url: 'https://your.nextstep.is/draft-journey'
      })

      expect(result.errors[0]).toMatchObject({
        message: 'Journey not found or not published',
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
      expect(createShortLink).not.toHaveBeenCalled()
      expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
    })

    it('rejects something that is not a journey link (BAD_USER_INPUT, field url)', async () => {
      const result = await update({ url: 'not a link' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'url'
      })
      expect(prismaMock.journey.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('Campaign QR Code', () => {
    it('linking creates a QrCode row in the campaign team targeting the journey, through the short-link create in the same mutation', async () => {
      await update({ url: 'https://admin.nextstep.is/journeys/journeyId' })

      expect(createShortLink).toHaveBeenCalledWith({
        id: expect.stringMatching(/^[0-9a-f-]{36}$/),
        hostname: 'short.example.org',
        to: expect.stringMatching(UTM),
        service: 'apiJourneys'
      })
      const { id: shortLinkId, to } =
        vi.mocked(createShortLink).mock.calls[0][0]
      expect(to).toBe(
        `https://example.com/christmas-europe?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`
      )
      expect(prismaMock.qrCode.create).toHaveBeenCalledWith({
        data: {
          teamId: 'teamId',
          journeyId: 'journeyId',
          toJourneyId: 'journeyId',
          shortLinkId
        }
      })
      expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'eurRegionId-529' },
          data: {
            journeyId: 'journeyId',
            title: 'christmas-europe title',
            description: 'christmas-europe description',
            qrCodeId: 'qrCodeId'
          }
        })
      )
      expect(updateShortLink).not.toHaveBeenCalled()
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })

    it("builds the short-link target on the journey's own team domain", async () => {
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow('journeyId', 'christmas-europe', {
          team: {
            id: 'otherTeamId',
            customDomains: [
              { name: 'journeys.example.org', routeAllTeamJourneys: true }
            ]
          }
        }) as never
      )

      await update({ url: 'https://admin.nextstep.is/journeys/journeyId' })

      expect(vi.mocked(createShortLink).mock.calls[0][0].to).toMatch(
        /^https:\/\/journeys\.example\.org\/christmas-europe\?utm_source=ns-qr-code&utm_campaign=/
      )
    })

    it('swapping the journey retargets the same short link; the QR row and qrCodeId are unchanged', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('otherJourneyId', 'noel-europe') as never
      )

      const result = await update({
        url: 'https://admin.nextstep.is/journeys/otherJourneyId'
      })

      expect(result.data.campaignRegionLanguageUpdate).toEqual({
        id: 'eurRegionId-529',
        journeyId: 'otherJourneyId',
        title: 'noel-europe title',
        description: 'noel-europe description',
        qrCodeId: 'qrCodeId'
      })
      expect(updateShortLink).toHaveBeenCalledWith({
        id: 'shortLinkId',
        to: 'https://example.com/noel-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      })
      expect(prismaMock.qrCode.update).toHaveBeenCalledWith({
        where: { id: 'qrCodeId' },
        data: { journeyId: 'otherJourneyId', toJourneyId: 'otherJourneyId' }
      })
      expect(createShortLink).not.toHaveBeenCalled()
      expect(prismaMock.qrCode.create).not.toHaveBeenCalled()
      expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
      expect(
        vi.mocked(prismaMock.campaignRegionLanguage.update).mock.calls[0][0]
          .data
      ).not.toHaveProperty('qrCodeId')
    })

    it('unlinking deletes the QR row and its short link; relinking creates a new one', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())

      const result = await update({ journeyId: null })

      expect(result.data.campaignRegionLanguageUpdate).toEqual({
        id: 'eurRegionId-529',
        journeyId: null,
        title: null,
        description: null,
        qrCodeId: null
      })
      expect(deleteShortLink).toHaveBeenCalledWith('shortLinkId')
      expect(prismaMock.qrCode.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['qrCodeId'] } }
      })

      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
        campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529')
      )
      await update({ url: 'https://admin.nextstep.is/journeys/journeyId' })

      expect(createShortLink).toHaveBeenCalledTimes(1)
      expect(prismaMock.qrCode.create).toHaveBeenCalledTimes(1)
      expect(updateShortLink).not.toHaveBeenCalled()
    })

    describe('gateway consistency', () => {
      it('takes the row lock, then applies the short-link create last, after every database write', async () => {
        await update({ url: 'https://admin.nextstep.is/journeys/journeyId' })

        const order = (mock: unknown): number =>
          vi.mocked(mock as () => void).mock.invocationCallOrder[0]
        expect(order(prismaMock.$queryRaw)).toBeLessThan(
          order(prismaMock.qrCode.create)
        )
        expect(order(prismaMock.qrCode.create)).toBeLessThan(
          order(createShortLink)
        )
        expect(order(prismaMock.campaignRegionLanguage.update)).toBeLessThan(
          order(createShortLink)
        )
        expect(order(prismaMock.campaign.update)).toBeLessThan(
          order(createShortLink)
        )
      })

      it('decides from the row re-read under the lock: a concurrent link already made leaves a second call retargeting, not creating', async () => {
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValueOnce(
          campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529')
        )
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())
        prismaMock.journey.findFirst.mockResolvedValue(
          journeyRow('otherJourneyId', 'noel-europe') as never
        )

        await update({
          url: 'https://admin.nextstep.is/journeys/otherJourneyId'
        })

        expect(createShortLink).not.toHaveBeenCalled()
        expect(prismaMock.qrCode.create).not.toHaveBeenCalled()
        expect(updateShortLink).toHaveBeenCalledTimes(1)
      })

      it('rolls back with nothing left at the gateway when the short-link create fails', async () => {
        vi.mocked(createShortLink).mockRejectedValue(new Error('gateway down'))

        const result = await update({
          url: 'https://admin.nextstep.is/journeys/journeyId'
        })

        expect(result.errors).toBeDefined()
        expect(deleteShortLink).not.toHaveBeenCalled()
      })

      it('deletes the new short link when the commit fails after the create', async () => {
        prismaMock.$transaction.mockImplementationOnce((async (
          callback: any
        ) => {
          await callback(prismaMock)
          throw new Error('transaction timed out')
        }) as never)

        const result = await update({
          url: 'https://admin.nextstep.is/journeys/journeyId'
        })

        expect(result.errors).toBeDefined()
        const createdId = vi.mocked(createShortLink).mock.calls[0][0].id
        expect(deleteShortLink).toHaveBeenCalledWith(createdId)
      })

      it('points a retargeted short link back at the previous journey when the commit fails after the retarget', async () => {
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())
        prismaMock.journey.findFirst.mockResolvedValue(
          journeyRow('otherJourneyId', 'noel-europe') as never
        )
        prismaMock.$transaction.mockImplementationOnce((async (
          callback: any
        ) => {
          await callback(prismaMock)
          throw new Error('transaction timed out')
        }) as never)

        const result = await update({
          url: 'https://admin.nextstep.is/journeys/otherJourneyId'
        })

        expect(result.errors).toBeDefined()
        expect(updateShortLink).toHaveBeenCalledTimes(2)
        expect(updateShortLink).toHaveBeenLastCalledWith({
          id: 'shortLinkId',
          to: 'https://example.com/christmas-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
        })
      })

      it('deletes the short link only after the QR row is deleted and the transaction has committed, and a failed delete does not fail the unlink', async () => {
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())
        let committed = false
        prismaMock.$transaction.mockImplementationOnce((async (
          callback: any
        ) => {
          const result = await callback(prismaMock)
          committed = true
          return result
        }) as never)
        vi.mocked(deleteShortLink).mockImplementation(async () => {
          expect(committed).toBe(true)
          throw new Error('gateway down')
        })

        const result = await update({ journeyId: null })

        expect(result.errors).toBeUndefined()
        expect(deleteShortLink).toHaveBeenCalledWith('shortLinkId')
        expect(
          vi.mocked(prismaMock.qrCode.deleteMany).mock.invocationCallOrder[0]
        ).toBeLessThan(vi.mocked(deleteShortLink).mock.invocationCallOrder[0])
      })
    })

    it('links a journey by id, published only', async () => {
      await update({ journeyId: 'journeyId' })

      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'journeyId', status: 'published', deletedAt: null }
        })
      )
      expect(createShortLink).toHaveBeenCalledTimes(1)
    })
  })

  it("linking another team's journey needs only campaign Update: no membership of its team and no UserJourney row", async () => {
    const result = await update({
      url: 'https://admin.nextstep.is/journeys/journeyId'
    })

    expect(result.errors).toBeUndefined()
    expect(fixture.teamId).not.toBe('otherTeamId')
    expect(prismaMock.userJourney.create).not.toHaveBeenCalled()
    expect(prismaMock.userJourney.upsert).not.toHaveBeenCalled()
    expect(prismaMock.userTeam.findUnique).not.toHaveBeenCalled()
    expect(prismaMock.userTeam.findFirst).not.toHaveBeenCalled()
  })

  it('edits the snapshot title and description within their caps', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())

    const result = await update({ title: '  Our title ', description: null })

    expect(result.data.campaignRegionLanguageUpdate).toMatchObject({
      title: 'Our title',
      description: null,
      journeyId: 'journeyId',
      qrCodeId: 'qrCodeId'
    })
    expect(createShortLink).not.toHaveBeenCalled()
    expect(updateShortLink).not.toHaveBeenCalled()

    const tooLong = await update({ title: 'x'.repeat(201) })
    expect(tooLong.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'title'
    })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
      campaignRegionLanguageWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId',
        '529'
      )
    )

    const result = await update({
      url: 'https://admin.nextstep.is/journeys/journeyId'
    })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(createShortLink).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown row', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(null)

    const result = await update({ title: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
