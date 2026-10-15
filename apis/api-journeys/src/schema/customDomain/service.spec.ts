import { vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'

import { updateTeamShortLinks } from './service'

const mockMutate = vi.fn()
vi.mock('@apollo/client', () => ({
  ApolloClient: vi.fn(function () {
    return { mutate: mockMutate }
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
    })

    it('does nothing for a team without QR codes', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([])

      await updateTeamShortLinks('teamId')

      expect(prismaMock.qrCode.findMany).toHaveBeenCalledWith({
        where: { teamId: 'teamId' }
      })
      expect(mockMutate).not.toHaveBeenCalled()
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

    it('leaves a QR code that was retargeted to another journey alone', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow({ toJourneyId: 'otherJourneyId' })
      ])

      await updateTeamShortLinks('teamId')

      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('reads through the transaction client it is given', async () => {
      const tx = {
        qrCode: { findMany: vi.fn().mockResolvedValue([qrCodeRow()]) },
        journey: {
          findUniqueOrThrow: vi.fn().mockResolvedValue(journeyRow())
        },
        block: { findUniqueOrThrow: vi.fn() }
      }

      await updateTeamShortLinks('teamId', tx as never)

      expect(tx.qrCode.findMany).toHaveBeenCalledWith({
        where: { teamId: 'teamId' }
      })
      expect(tx.journey.findUniqueOrThrow).toHaveBeenCalled()
      expect(prismaMock.qrCode.findMany).not.toHaveBeenCalled()
      expect(prismaMock.journey.findUniqueOrThrow).not.toHaveBeenCalled()
    })
  })
})
