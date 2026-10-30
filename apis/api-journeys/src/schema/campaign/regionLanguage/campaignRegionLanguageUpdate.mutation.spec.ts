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
import { GATEWAY_TIMEOUT_MS } from '../../../lib/gateway/graphqlRequest'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import {
  createShortLink,
  deleteShortLink,
  updateShortLink
} from '../../qrCode/qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../campaignWrite', () => ({ campaignWrite: vi.fn() }))

vi.mock('../../qrCode/qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../qrCode/qrCode.service')>()),
  createShortLink: vi.fn(),
  updateShortLink: vi.fn(),
  deleteShortLink: vi.fn(),
  getShortLinkDomain: vi.fn(() => 'short.example.org')
}))

const UTM = /\?utm_source=ns-qr-code&utm_campaign=[0-9a-f-]{36}$/

/**
 * A live-published journey of another team, as the paste resolution reads it,
 * whose team the caller is a member of: the caller may see its stats.
 */
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
    team: {
      id: 'otherTeamId',
      customDomains: [],
      userTeams: [{ teamId: 'otherTeamId', userId: 'userId', role: 'member' }]
    },
    userJourneys: [],
    journeyCollectionJourneys: [],
    ...overrides
  }
}

/** The same journey with the given access: no team role and no journey role unless named. */
function journeyWithAccess(access: {
  teamRole?: 'manager' | 'member'
  journeyRole?: 'owner' | 'editor' | 'inviteRequested'
}): Record<string, unknown> {
  return journeyRow('journeyId', 'outreach-europe', {
    team: {
      id: 'otherTeamId',
      customDomains: [],
      userTeams:
        access.teamRole == null
          ? [{ teamId: 'otherTeamId', userId: 'someoneElse', role: 'manager' }]
          : [{ teamId: 'otherTeamId', userId: 'userId', role: access.teamRole }]
    },
    userJourneys:
      access.journeyRole == null
        ? []
        : [
            {
              journeyId: 'journeyId',
              userId: 'userId',
              role: access.journeyRole
            }
          ]
  })
}

const QR_CODE = {
  id: 'qrCodeId',
  teamId: 'teamId',
  journeyId: 'journeyId',
  toJourneyId: 'journeyId',
  toBlockId: null,
  shortLinkId: 'shortLinkId',
  shortLinkUrl: 'https://short.example.org/shortLinkId',
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
  let writes: CampaignWriteCall[]

  beforeEach(() => {
    setupCampaignBlockSpec()
    writes = fakeCampaignWrite(prismaMock)
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
      journeyRow('journeyId', 'outreach-europe') as never
    )
    prismaMock.journey.findUniqueOrThrow.mockImplementation((async ({
      where
    }: any) =>
      journeyRow(
        where.id,
        where.id === 'journeyId' ? 'outreach-europe' : 'noel-europe'
      )) as never)
    prismaMock.qrCode.create.mockImplementation((async ({ data }: any) => ({
      ...QR_CODE,
      ...data
    })) as never)
    vi.mocked(createShortLink).mockImplementation(async ({ id }) => ({
      id,
      shortUrl: `https://short.example.org/${id}`
    }))
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

  async function update(
    input: Record<string, unknown>
  ): Promise<CampaignSpecResult<typeof UPDATE>> {
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
        title: 'outreach-europe title',
        description: 'outreach-europe description',
        qrCodeId: 'qrCodeId'
      })
      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'journeyId',
            status: { in: ['published'] },
            deletedAt: null
          }
        })
      )
    })

    it('cuts the snapshot to the caps an edit is held to: title 200, description 1000', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('journeyId', 'christmas-europe', {
          title: '😀'.repeat(250),
          description: '😀'.repeat(1800)
        }) as never
      )

      const result = await update({
        url: 'https://admin.nextstep.is/journeys/journeyId'
      })

      expect(result.data.campaignRegionLanguageUpdate).toMatchObject({
        title: '😀'.repeat(200),
        description: '😀'.repeat(1000)
      })
      expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: '😀'.repeat(200),
            description: '😀'.repeat(1000)
          })
        })
      )
    })

    it('resolves a public URL on any domain by slug', async () => {
      await update({ url: 'https://journeys.example.org/outreach-europe' })

      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: 'outreach-europe',
            status: { in: ['published'] },
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

      expect(result.errors?.[0]).toMatchObject({
        message: 'Journey not found or not published',
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
      expect(createShortLink).not.toHaveBeenCalled()
      expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
    })

    it('rejects something that is not a journey link (BAD_USER_INPUT, field url)', async () => {
      const result = await update({ url: 'not a link' })

      expect(result.errors?.[0].extensions).toMatchObject({
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
        `https://example.com/outreach-europe?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`
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
            title: 'outreach-europe title',
            description: 'outreach-europe description',
            snapshotEdited: false,
            qrCodeId: 'qrCodeId'
          }
        })
      )
      expect(updateShortLink).not.toHaveBeenCalled()
      expect(writes).toEqual([
        {
          campaignId: 'campaignId',
          declaration: { shareLanguage: 'eurRegionId-529' },
          options: { timeout: GATEWAY_TIMEOUT_MS + 5_000 },
          jobs: [],
          step: { apply: expect.any(Function), revert: expect.any(Function) },
          touched: true
        }
      ])
    })

    it("builds the short-link target on the journey's own team domain", async () => {
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow('journeyId', 'outreach-europe', {
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
        /^https:\/\/journeys\.example\.org\/outreach-europe\?utm_source=ns-qr-code&utm_campaign=/
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

    describe('unlink keeps the Campaign QR Code', () => {
      /** Unlinked earlier: the QR row is kept, still targeting `journeyId`. */
      function unlinkedKeepingQrCode() {
        return campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529', {
          journeyId: null,
          title: null,
          description: null,
          qrCodeId: 'qrCodeId',
          qrCode: QR_CODE
        })
      }

      function queuedShortLinkDeletes(): unknown[] {
        return mockQueueAdd.mock.calls.filter(
          ([name]) => name === 'api-journeys-shortlink-delete-job'
        )
      }

      it('unlinking clears the journey and snapshot but keeps the QR row and its short link', async () => {
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())

        const result = await update({ journeyId: null })

        expect(result.data.campaignRegionLanguageUpdate).toEqual({
          id: 'eurRegionId-529',
          journeyId: null,
          title: null,
          description: null,
          qrCodeId: 'qrCodeId'
        })
        expect(
          vi.mocked(prismaMock.campaignRegionLanguage.update).mock.calls[0][0]
            .data
        ).toEqual({
          journeyId: null,
          title: null,
          description: null,
          snapshotEdited: false
        })
        expect(prismaMock.qrCode.deleteMany).not.toHaveBeenCalled()
        expect(deleteShortLink).not.toHaveBeenCalled()
        expect(updateShortLink).not.toHaveBeenCalled()
        expect(queuedShortLinkDeletes()).toEqual([])
      })

      it('linking another journey afterwards retargets the same QR row and short link', async () => {
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
          unlinkedKeepingQrCode()
        )
        prismaMock.journey.findFirst.mockResolvedValue(
          journeyRow('otherJourneyId', 'noel-europe') as never
        )

        const result = await update({
          url: 'https://admin.nextstep.is/journeys/otherJourneyId'
        })

        expect(result.data.campaignRegionLanguageUpdate).toMatchObject({
          journeyId: 'otherJourneyId',
          qrCodeId: 'qrCodeId'
        })
        expect(prismaMock.qrCode.update).toHaveBeenCalledWith({
          where: { id: 'qrCodeId' },
          data: { journeyId: 'otherJourneyId', toJourneyId: 'otherJourneyId' }
        })
        expect(updateShortLink).toHaveBeenCalledWith({
          id: 'shortLinkId',
          to: 'https://example.com/noel-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
        })
        expect(prismaMock.qrCode.create).not.toHaveBeenCalled()
        expect(createShortLink).not.toHaveBeenCalled()
      })

      it('linking the same journey back changes no short link', async () => {
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
          unlinkedKeepingQrCode()
        )

        const result = await update({
          url: 'https://admin.nextstep.is/journeys/journeyId'
        })

        expect(result.data.campaignRegionLanguageUpdate).toMatchObject({
          journeyId: 'journeyId',
          qrCodeId: 'qrCodeId'
        })
        expect(prismaMock.qrCode.update).not.toHaveBeenCalled()
        expect(prismaMock.qrCode.create).not.toHaveBeenCalled()
        expect(updateShortLink).not.toHaveBeenCalled()
        expect(createShortLink).not.toHaveBeenCalled()
      })
    })

    describe('gateway consistency', () => {
      it('declares the row, and makes the short-link create the external step, after every database write', async () => {
        await update({ url: 'https://admin.nextstep.is/journeys/journeyId' })

        const order = (mock: unknown): number =>
          vi.mocked(mock as () => void).mock.invocationCallOrder[0]
        expect(writes).toEqual([
          expect.objectContaining({
            declaration: { shareLanguage: 'eurRegionId-529' },
            step: expect.objectContaining({ apply: expect.any(Function) })
          })
        ])
        // Not lock order: the gateway call waits for the step, after the body's writes.
        expect(order(prismaMock.qrCode.create)).toBeLessThan(
          order(createShortLink)
        )
        expect(order(prismaMock.campaignRegionLanguage.update)).toBeLessThan(
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

        expect(result.errors?.[0].message).toBe('gateway down')
        expect(deleteShortLink).not.toHaveBeenCalled()
      })

      it('gives the transaction a timeout that outlasts the short-link gateway call', async () => {
        await update({ url: 'https://admin.nextstep.is/journeys/journeyId' })

        expect(writes.map(({ options }) => options)).toEqual([
          { timeout: GATEWAY_TIMEOUT_MS + 5_000 }
        ])
      })

      it('reverts the create by queueing the delete of the new short link, for a commit that fails after it', async () => {
        await update({
          url: 'https://admin.nextstep.is/journeys/journeyId'
        })
        await writes[0].step?.revert()

        const createdId = vi.mocked(createShortLink).mock.calls[0][0].id
        expect(
          mockQueueAdd.mock.calls
            .filter(([name]) => name === 'api-journeys-shortlink-delete-job')
            .map(([, data]) => data.shortLinkId)
        ).toEqual([createdId])
        expect(deleteShortLink).not.toHaveBeenCalled()
      })

      it('reverts a retarget by pointing the short link back at the previous journey, for a commit that fails after it', async () => {
        prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())
        prismaMock.journey.findFirst.mockResolvedValue(
          journeyRow('otherJourneyId', 'noel-europe') as never
        )

        await update({
          url: 'https://admin.nextstep.is/journeys/otherJourneyId'
        })
        await writes[0].step?.revert()

        expect(updateShortLink).toHaveBeenCalledTimes(2)
        expect(updateShortLink).toHaveBeenLastCalledWith({
          id: 'shortLinkId',
          to: 'https://example.com/outreach-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
        })
      })
    })

    it('links a journey by id, published only', async () => {
      await update({ journeyId: 'journeyId' })

      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'journeyId',
            status: { in: ['published'] },
            deletedAt: null
          }
        })
      )
      expect(createShortLink).toHaveBeenCalledTimes(1)
    })

    it('re-linking the journey already linked mints the missing QR code and keeps an edited snapshot', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
        campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529', {
          journeyId: 'journeyId',
          title: 'Our title',
          description: 'Our description',
          snapshotEdited: true,
          qrCodeId: null,
          qrCode: null
        })
      )

      const result = await update({ journeyId: 'journeyId' })

      expect(result.data.campaignRegionLanguageUpdate).toEqual({
        id: 'eurRegionId-529',
        journeyId: 'journeyId',
        title: 'Our title',
        description: 'Our description',
        qrCodeId: 'qrCodeId'
      })
      expect(createShortLink).toHaveBeenCalledTimes(1)
      expect(
        vi.mocked(prismaMock.campaignRegionLanguage.update).mock.calls[0][0]
          .data
      ).toEqual({ qrCodeId: 'qrCodeId' })
    })
  })

  describe('journey access: linking needs the right to see the journey stats', () => {
    it('loads the journey with what the journey ACL reads', async () => {
      await update({ url: 'https://admin.nextstep.is/journeys/journeyId' })

      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            userJourneys: true,
            team: {
              include: expect.objectContaining({ userTeams: true })
            }
          })
        })
      )
    })

    it.each([
      ['a team member', { teamRole: 'member' as const }],
      ['a team manager', { teamRole: 'manager' as const }],
      ['the journey owner', { journeyRole: 'owner' as const }],
      ['the journey editor', { journeyRole: 'editor' as const }]
    ])('links a journey of another team for %s', async (_who, access) => {
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyWithAccess(access) as never
      )

      const result = await update({
        url: 'https://admin.nextstep.is/journeys/journeyId'
      })

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignRegionLanguageUpdate.journeyId).toBe(
        'journeyId'
      )
      expect(fixture.teamId).not.toBe('otherTeamId')
      expect(prismaMock.userJourney.create).not.toHaveBeenCalled()
      expect(prismaMock.userJourney.upsert).not.toHaveBeenCalled()
    })

    it.each([
      ['url', { url: 'https://journeys.example.org/outreach-europe' }],
      ['journeyId', { journeyId: 'journeyId' }]
    ])(
      'refuses a journey linked by %s for a caller outside its team with no journey role (FORBIDDEN on that field)',
      async (field, input) => {
        prismaMock.journey.findFirst.mockResolvedValue(
          journeyWithAccess({ journeyRole: 'inviteRequested' }) as never
        )

        const result = await update(input)

        expect(result.errors?.[0]).toMatchObject({
          message: 'You can only link a journey whose stats you can see',
          extensions: { code: 'FORBIDDEN', field }
        })
        expect(writes).toEqual([])
        expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
        expect(createShortLink).not.toHaveBeenCalled()
      }
    )

    it('refuses an undo of an unlink that writes back a journey the caller cannot see', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
        campaignRegionLanguageWithAcl(fixture, 'eurRegionId', '529', {
          journeyId: null,
          title: null,
          description: null,
          qrCodeId: 'qrCodeId',
          qrCode: QR_CODE
        })
      )
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyWithAccess({}) as never
      )

      const result = await update({ journeyId: 'journeyId' })

      expect(result.errors?.[0]).toMatchObject({
        message: 'You can only link a journey whose stats you can see',
        extensions: { code: 'FORBIDDEN', field: 'journeyId' }
      })
      expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
      expect(updateShortLink).not.toHaveBeenCalled()
    })

    it('refuses an undo of a relink that writes back a journey the caller cannot see', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(
        linked('otherJourneyId')
      )
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyWithAccess({}) as never
      )

      const result = await update({ journeyId: 'journeyId' })

      expect(result.errors?.[0]).toMatchObject({
        message: 'You can only link a journey whose stats you can see',
        extensions: { code: 'FORBIDDEN', field: 'journeyId' }
      })
      expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
      expect(updateShortLink).not.toHaveBeenCalled()
    })

    it('refuses re-sending the journey already linked when the caller cannot see it', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyWithAccess({}) as never
      )

      const result = await update({ journeyId: 'journeyId' })

      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'FORBIDDEN',
        field: 'journeyId'
      })
      expect(prismaMock.campaignRegionLanguage.update).not.toHaveBeenCalled()
    })

    it('clears a link to a journey the caller cannot see without reading the journey', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyWithAccess({}) as never
      )

      const result = await update({ journeyId: null })

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignRegionLanguageUpdate.journeyId).toBeNull()
      expect(prismaMock.journey.findFirst).not.toHaveBeenCalled()
    })

    it('re-describes a link without checking journey access', async () => {
      prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())

      const result = await update({ title: 'Our title' })

      expect(result.errors).toBeUndefined()
      expect(prismaMock.journey.findFirst).not.toHaveBeenCalled()
    })

    it('checks an unknown journey before access: BAD_USER_INPUT, not FORBIDDEN', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(null)

      const result = await update({ journeyId: 'journeyId' })

      expect(result.errors?.[0]).toMatchObject({
        message: 'Journey not found or not published',
        extensions: { code: 'BAD_USER_INPUT', field: 'journeyId' }
      })
    })
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
    expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: 'Our title', description: null, snapshotEdited: true }
      })
    )

    const tooLong = await update({ title: 'x'.repeat(201) })
    expect(tooLong.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'title'
    })
  })

  it('sets the edited flag outright when the input carries it, as an undo does', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(linked())

    const result = await update({
      title: 'Before',
      description: 'Before too',
      snapshotEdited: false
    })

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignRegionLanguage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          title: 'Before',
          description: 'Before too',
          snapshotEdited: false
        }
      })
    )
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

    expect(result.errors?.[0].message).toBe(
      'user is not allowed to update share language'
    )
    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(createShortLink).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown row', async () => {
    prismaMock.campaignRegionLanguage.findUnique.mockResolvedValue(null)

    const result = await update({ title: 'x' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
