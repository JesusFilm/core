import { prismaMock } from '../../../test/prismaMock'

import { createShortLink, getTo, parseAndVerifyTo } from './qrCode.service'

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
      prismaMock.journey.findFirst.mockResolvedValue(
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
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )

      await expect(
        parseAndVerifyTo('https://example.com/christmas-europe', 'teamId')
      ).resolves.toEqual({ toJourneyId: 'journeyId', toBlockId: undefined })
    })

    it('resolves the block of the address', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'blockId'
      } as never)

      await expect(
        parseAndVerifyTo(
          'https://example.com/christmas-europe/blockId',
          'teamId'
        )
      ).resolves.toEqual({ toJourneyId: 'journeyId', toBlockId: 'blockId' })
      expect(prismaMock.block.findFirst).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId', id: 'blockId' }
      })
    })

    it('rejects a host that does not serve the journey', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('christmas-europe', [
          { name: 'journeys.example.org', routeAllTeamJourneys: true }
        ]) as never
      )

      await expect(
        parseAndVerifyTo('https://example.com/christmas-europe', 'teamId')
      ).rejects.toThrow('Invalid hostname')
    })

    it("only looks up live journeys that are published or the QR code team's own", async () => {
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )

      await parseAndVerifyTo('https://example.com/christmas-europe', 'teamId')

      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
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

    it('answers BAD_USER_INPUT on to for a non-URL', async () => {
      await expect(
        parseAndVerifyTo('not a url', 'teamId')
      ).rejects.toMatchObject({
        message: 'to must be a URL',
        extensions: { code: 'BAD_USER_INPUT', field: 'to' }
      })
    })

    it('answers BAD_USER_INPUT on to for an unknown slug', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(null)

      await expect(
        parseAndVerifyTo('https://example.com/unknown', 'teamId')
      ).rejects.toMatchObject({
        message: 'to does not name a journey this QR code can point at',
        extensions: { code: 'BAD_USER_INPUT', field: 'to' }
      })
    })

    it("answers BAD_USER_INPUT on to for another team's unpublished journey", async () => {
      prismaMock.journey.findFirst.mockResolvedValue(null)

      await expect(
        parseAndVerifyTo('https://example.com/foreign-draft', 'teamId')
      ).rejects.toMatchObject({
        extensions: { code: 'BAD_USER_INPUT', field: 'to' }
      })
      expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ status: 'published' }, { teamId: 'teamId' }]
          })
        })
      )
    })

    it('answers BAD_USER_INPUT on to for a block outside the journey', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )
      prismaMock.block.findFirst.mockResolvedValue(null)

      await expect(
        parseAndVerifyTo(
          'https://example.com/christmas-europe/otherBlockId',
          'teamId'
        )
      ).rejects.toMatchObject({
        message: 'to names a block that is not in that journey',
        extensions: { code: 'BAD_USER_INPUT', field: 'to' }
      })
    })

    it('gives the hostname refusal the to field', async () => {
      prismaMock.journey.findFirst.mockResolvedValue(
        journeyRow('christmas-europe', [
          { name: 'journeys.example.org', routeAllTeamJourneys: true }
        ]) as never
      )

      await expect(
        parseAndVerifyTo('https://example.com/christmas-europe', 'teamId')
      ).rejects.toMatchObject({
        extensions: { code: 'BAD_USER_INPUT', field: 'to' }
      })
    })
  })

  describe('createShortLink', () => {
    function gatewayResponse(body: unknown): Response {
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it("returns the link's id and api-media's shortUrl", async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        gatewayResponse({
          data: {
            shortLinkCreate: {
              __typename: 'MutationShortLinkCreateSuccess',
              data: {
                id: 'shortLinkId',
                shortUrl: 'https://short.example.org/q/abc123'
              }
            }
          }
        })
      )

      await expect(
        createShortLink({
          id: 'shortLinkId',
          hostname: 'short.example.org',
          to: 'https://example.com/christmas-europe',
          service: 'apiJourneys'
        })
      ).resolves.toEqual({
        id: 'shortLinkId',
        shortUrl: 'https://short.example.org/q/abc123'
      })
      const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)
      expect(body.query).toContain('data { id shortUrl }')
    })

    it('returns a null shortUrl when api-media returns no link', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        gatewayResponse({ data: { shortLinkCreate: {} } })
      )

      await expect(
        createShortLink({
          id: 'shortLinkId',
          hostname: 'short.example.org',
          to: 'https://example.com/christmas-europe',
          service: 'apiJourneys'
        })
      ).resolves.toEqual({ id: 'shortLinkId', shortUrl: null })
    })
  })
})
