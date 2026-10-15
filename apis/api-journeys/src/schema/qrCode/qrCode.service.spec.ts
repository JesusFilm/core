import { prismaMock } from '../../../test/prismaMock'

import { getTo, parseAndVerifyTo } from './qrCode.service'

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
        teamId: 'teamId',
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
        teamId: 'campaignTeamId',
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
        teamId: 'journeyTeamId',
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
        teamId: 'teamId',
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
        parseAndVerifyTo('https://journeys.example.org/christmas-europe')
      ).resolves.toEqual({ toJourneyId: 'journeyId', toBlockId: undefined })
      expect(prismaMock.customDomain.findMany).not.toHaveBeenCalled()
    })

    it('accepts the root domain for a journey without a custom domain', async () => {
      prismaMock.journey.findFirstOrThrow.mockResolvedValue(
        journeyRow('christmas-europe') as never
      )

      await expect(
        parseAndVerifyTo('https://example.com/christmas-europe')
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
        parseAndVerifyTo('https://example.com/christmas-europe/blockId')
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
        parseAndVerifyTo('https://example.com/christmas-europe')
      ).rejects.toThrow('Invalid hostname')
    })

    it('rejects an address without a journey slug', async () => {
      await expect(parseAndVerifyTo('https://example.com/')).rejects.toThrow(
        'Invalid to'
      )
    })
  })
})
