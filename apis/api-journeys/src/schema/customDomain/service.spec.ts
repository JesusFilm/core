import { vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'

import { updateTeamShortLinks } from './service'

const mockQuery = vi.fn()
const mockMutate = vi.fn()
vi.mock('@apollo/client', () => ({
  ApolloClient: vi.fn(function () {
    return { query: mockQuery, mutate: mockMutate }
  }),
  InMemoryCache: vi.fn(),
  HttpLink: vi.fn()
}))

function qrCodeRow(overrides: Record<string, unknown> = {}): never {
  return {
    id: 'qrCodeId',
    teamId: 'teamId',
    journeyId: 'journeyId',
    toJourneyId: 'journeyId',
    toBlockId: null,
    shortLinkId: 'shortLinkId',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    ...overrides
  } as never
}

function journeyRow(
  customDomains: Array<{ name: string; routeAllTeamJourneys: boolean }> = []
): never {
  return {
    id: 'journeyId',
    slug: 'my-journey',
    teamId: 'teamId',
    team: { id: 'teamId', customDomains },
    journeyCollectionJourneys: []
  } as never
}

describe('customDomain service', () => {
  describe('updateTeamShortLinks', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      prismaMock.journey.findMany.mockResolvedValue([])
      mockQuery.mockResolvedValue({ data: { shortLink: null } })
      mockMutate.mockResolvedValue({
        data: {
          shortLinkUpdate: {
            __typename: 'MutationShortLinkUpdateSuccess',
            data: { id: 'shortLinkId', to: 'to' }
          }
        }
      })
    })

    it('does nothing for a team without QR codes', async () => {
      prismaMock.journey.findMany.mockResolvedValue([])
      prismaMock.qrCode.findMany.mockResolvedValue([])

      await updateTeamShortLinks('teamId')

      expect(prismaMock.qrCode.findMany).toHaveBeenCalledWith({
        where: { OR: [{ teamId: 'teamId' }, { toJourneyId: { in: [] } }] }
      })
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it("selects the QR codes of the team and those pointing at the team's journeys", async () => {
      prismaMock.journey.findMany.mockResolvedValue([
        { id: 'journeyId' },
        { id: 'otherJourneyId' }
      ] as never)
      prismaMock.qrCode.findMany.mockResolvedValue([])

      await updateTeamShortLinks('teamId')

      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: { teamId: 'teamId' },
        select: { id: true }
      })
      expect(prismaMock.qrCode.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { teamId: 'teamId' },
            { toJourneyId: { in: ['journeyId', 'otherJourneyId'] } }
          ]
        }
      })
    })

    it("rewrites another team's campaign QR code that points at the team's journey", async () => {
      prismaMock.journey.findMany.mockResolvedValue([
        { id: 'journeyId' }
      ] as never)
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow({
          teamId: 'campaignTeamId',
          journeyId: 'campaignJourneyId',
          campaignRegionLanguages: [{ id: 'regionLanguageId' }]
        })
      ])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())

      await updateTeamShortLinks('teamId')

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'shortLinkId',
              to: 'https://example.com/my-journey?utm_source=ns-qr-code&utm_campaign=shortLinkId'
            }
          }
        })
      )
    })

    it('rewrites the short link of a journey QR code to the team domain', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([qrCodeRow()])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow([{ name: 'christmas.org', routeAllTeamJourneys: true }])
      )

      await updateTeamShortLinks('teamId')

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'shortLinkId',
              to: 'https://christmas.org/my-journey?utm_source=ns-qr-code&utm_campaign=shortLinkId'
            }
          }
        })
      )
    })

    it('rewrites a campaign QR code through the same target', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow({ campaignRegionLanguages: [{ id: 'regionLanguageId' }] })
      ])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow([{ name: 'christmas.org', routeAllTeamJourneys: true }])
      )

      await updateTeamShortLinks('teamId')

      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'shortLinkId',
              to: 'https://christmas.org/my-journey?utm_source=ns-qr-code&utm_campaign=shortLinkId'
            }
          }
        })
      )
    })

    it('points back at the root domain once the custom domain is gone', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([qrCodeRow()])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())

      await updateTeamShortLinks('teamId')

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'shortLinkId',
              to: 'https://example.com/my-journey?utm_source=ns-qr-code&utm_campaign=shortLinkId'
            }
          }
        })
      )
    })

    it('rewrites a QR code that was retargeted to another journey to that journey', async () => {
      prismaMock.journey.findMany.mockResolvedValue([] as never)
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow({ toJourneyId: 'otherJourneyId' })
      ])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())

      await updateTeamShortLinks('teamId')

      expect(prismaMock.journey.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'otherJourneyId' } })
      )
      expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    it('logs and skips a row whose getTo rejects while rewriting the others', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow({ toJourneyId: 'missingJourneyId', shortLinkId: 'missing' }),
        qrCodeRow({ id: 'qrCodeId2', shortLinkId: 'shortLinkId2' })
      ])
      prismaMock.journey.findUniqueOrThrow
        .mockRejectedValueOnce(new Error('No Journey found'))
        .mockResolvedValueOnce(journeyRow())

      await expect(updateTeamShortLinks('teamId')).resolves.toBeUndefined()

      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: expect.objectContaining({ id: 'shortLinkId2' })
          }
        })
      )
    })

    it('logs a ZodError result and does not throw', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([qrCodeRow()])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())
      mockMutate.mockResolvedValue({
        data: { shortLinkUpdate: { __typename: 'ZodError', message: 'bad' } }
      })

      await expect(updateTeamShortLinks('teamId')).resolves.toBeUndefined()

      expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    it('skips a short link whose stored target is unchanged', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([qrCodeRow()])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())
      mockQuery.mockResolvedValue({
        data: {
          shortLink: {
            __typename: 'QueryShortLinkSuccess',
            data: {
              to: 'https://example.com/my-journey?utm_source=ns-qr-code&utm_campaign=shortLinkId'
            }
          }
        }
      })

      await updateTeamShortLinks('teamId')

      expect(mockMutate).not.toHaveBeenCalled()
    })
  })
})
