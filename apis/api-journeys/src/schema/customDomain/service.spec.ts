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

describe('customDomain service', () => {
  describe('updateTeamShortLinks', () => {
    const originalJourneysUrl = process.env.JOURNEYS_URL

    beforeEach(() => {
      vi.clearAllMocks()
      process.env.JOURNEYS_URL = 'https://your.nextstep.is'
    })

    afterEach(() => {
      process.env.JOURNEYS_URL = originalJourneysUrl
    })

    it('leaves campaign region language QR codes alone', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([])

      await updateTeamShortLinks('teamId', 'christmas.org')

      expect(prismaMock.qrCode.findMany).toHaveBeenCalledWith({
        where: { teamId: 'teamId', campaignRegionLanguages: { none: {} } }
      })
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('rewrites the short link of a journey QR code', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        {
          id: 'qrCodeId',
          teamId: 'teamId',
          journeyId: 'journeyId',
          toJourneyId: 'journeyId',
          toBlockId: null,
          shortLinkId: 'shortLinkId',
          color: '#000000',
          backgroundColor: '#FFFFFF'
        }
      ])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue({
        id: 'journeyId',
        slug: 'my-journey'
      })

      await updateTeamShortLinks('teamId', 'christmas.org')

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'shortLinkId',
              to: 'https://christmas.org/my-journey?utm_source=ns-qr-code&utm_campaign=qrCodeId'
            }
          }
        })
      )
    })
  })
})
