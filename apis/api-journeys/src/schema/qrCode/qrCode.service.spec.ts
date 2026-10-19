import { prismaMock } from '../../../test/prismaMock'

import { createShortLink, getTo, parseAndVerifyTo } from './qrCode.service'

vi.hoisted(() => {
  process.env.GATEWAY_URL = 'http://gateway.test/'
})

function journeyRow(
  slug: string,
  customDomains: Array<{ name: string; routeAllTeamJourneys: boolean }> = []
): Record<string, unknown> {
  return {
    id: 'journeyId',
    slug,
    teamId: 'journeyTeamId',
    team: { id: 'journeyTeamId', customDomains },
    journeyCollectionJourneys: []
  }
}

describe('qrCode.service', () => {
  describe('createShortLink', () => {
    const input = {
      id: 'shortLinkId',
      hostname: 'localhost',
      to: 'http://localhost:4100/journey',
      service: 'apiJourneys'
    }

    function gatewayReplies(shortLinkCreate: Record<string, unknown>): void {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          json: async () => ({ data: { shortLinkCreate } })
        }))
      )
    }

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('returns the created id', async () => {
      gatewayReplies({
        __typename: 'MutationShortLinkCreateSuccess',
        data: { id: 'shortLinkId' }
      })

      await expect(createShortLink(input)).resolves.toEqual({
        id: 'shortLinkId'
      })
    })

    it('throws BAD_USER_INPUT when api-media refuses the link, so the caller rolls back instead of keeping a QR code without one', async () => {
      gatewayReplies({
        __typename: 'ZodError',
        message: 'must be a public http(s) URL'
      })

      await expect(createShortLink(input)).rejects.toMatchObject({
        message: 'must be a public http(s) URL',
        extensions: { code: 'BAD_USER_INPUT' }
      })
    })
  })

  describe('getTo', () => {
    it('keeps the existing target format exactly: journey public URL + utm_source and utm_campaign', async () => {
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )

      const to = await getTo({
        shortLinkId: 'shortLinkId',
        toJourneyId: 'journeyId'
      })

      expect(to).toBe(
        'https://example.com/christmas-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
      expect(prismaMock.journey.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
        include: {
          team: { include: { customDomains: true } },
          journeyCollectionJourneys: {
            include: { journeyCollection: { include: { customDomains: true } } }
          }
        }
      })
      expect(prismaMock.customDomain.findMany).not.toHaveBeenCalled()
    })

    it("resolves the domain from the target journey's team, not the QR row's team", async () => {
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow('christmas-europe', [
          { name: 'journeys.example.org', routeAllTeamJourneys: true }
        ]) as never
      )

      const to = await getTo({
        shortLinkId: 'shortLinkId',
        toJourneyId: 'journeyId'
      })

      expect(to).toBe(
        'https://journeys.example.org/christmas-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
    })

    it('is unchanged for an existing QR whose team owns the journey', async () => {
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow('christmas-europe', [
          { name: 'journeys.example.org', routeAllTeamJourneys: true }
        ]) as never
      )

      const to = await getTo({
        shortLinkId: 'shortLinkId',
        toJourneyId: 'journeyId'
      })

      expect(to).toBe(
        'https://journeys.example.org/christmas-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
    })

    it('appends the block path before the attribution parameters', async () => {
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )
      prismaMock.block.findUniqueOrThrow.mockResolvedValue({
        id: 'blockId',
        journeyId: 'journeyId'
      } as never)

      const to = await getTo({
        shortLinkId: 'shortLinkId',
        toJourneyId: 'journeyId',
        toBlockId: 'blockId'
      })

      expect(to).toBe(
        'https://example.com/christmas-europe/blockId?utm_source=ns-qr-code&utm_campaign=shortLinkId'
      )
      expect(prismaMock.block.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId', id: 'blockId' }
      })
    })
  })

  describe('parseAndVerifyTo', () => {
    it("accepts the target journey's own team domain, whichever team owns the QR row", async () => {
      prismaMock.journey.findFirstOrThrow.mockResolvedValue(
        journeyRow('christmas-europe', [
          { name: 'journeys.example.org', routeAllTeamJourneys: true }
        ]) as never
      )

      await expect(
        parseAndVerifyTo(
          'https://journeys.example.org/christmas-europe',
          'teamId'
        )
      ).resolves.toEqual({ toJourneyId: 'journeyId', toBlockId: undefined })
      expect(prismaMock.customDomain.findMany).not.toHaveBeenCalled()
    })

    it('accepts the root domain for a journey without a custom domain', async () => {
      prismaMock.journey.findFirstOrThrow.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )

      await expect(
        parseAndVerifyTo('https://example.com/christmas-europe', 'teamId')
      ).resolves.toEqual({ toJourneyId: 'journeyId', toBlockId: undefined })
    })

    it('resolves the block of the address', async () => {
      prismaMock.journey.findFirstOrThrow.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )
      prismaMock.block.findFirstOrThrow.mockResolvedValue({
        id: 'blockId'
      } as never)

      await expect(
        parseAndVerifyTo(
          'https://example.com/christmas-europe/blockId',
          'teamId'
        )
      ).resolves.toEqual({ toJourneyId: 'journeyId', toBlockId: 'blockId' })
      expect(prismaMock.block.findFirstOrThrow).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId', id: 'blockId' }
      })
    })

    it('rejects a host that does not serve the journey', async () => {
      prismaMock.journey.findFirstOrThrow.mockResolvedValue(
        journeyRow('christmas-europe', [
          { name: 'journeys.example.org', routeAllTeamJourneys: true }
        ]) as never
      )

      await expect(
        parseAndVerifyTo('https://example.com/christmas-europe', 'teamId')
      ).rejects.toThrow('Invalid hostname')
    })

    it("only looks up live journeys that are published or the QR code team's own", async () => {
      prismaMock.journey.findFirstOrThrow.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )

      await parseAndVerifyTo('https://example.com/christmas-europe', 'teamId')

      expect(prismaMock.journey.findFirstOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: 'christmas-europe',
            deletedAt: null,
            trashedAt: null,
            OR: [{ status: 'published' }, { teamId: 'teamId' }]
          }
        })
      )
    })

    it('rejects an address without a journey slug', async () => {
      await expect(
        parseAndVerifyTo('https://example.com/', 'teamId')
      ).rejects.toThrow('Invalid to')
    })
  })
})
