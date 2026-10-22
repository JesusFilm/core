import { Logger } from 'pino'
import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import {
  journeyRow,
  mockApolloClient,
  mockMutate,
  mockQuery,
  qrCodeRow
} from '../../../../test/qrCodeFixtures'

import {
  REWRITE_BATCH_SIZE,
  updateAllShortlinks,
  updateJourneyShortLink
} from './service'

function shortLinkResult(to: string) {
  return {
    data: { shortLink: { __typename: 'QueryShortLinkSuccess', data: { to } } }
  }
}

const updateSuccess = {
  data: {
    shortLinkUpdate: {
      __typename: 'MutationShortLinkUpdateSuccess',
      data: { id: 'shortLinkId', to: 'to' }
    }
  }
}

describe('shortlinkUpdater service', () => {
  const logger = {
    info: vi.fn(),
    error: vi.fn()
  } as unknown as Logger

  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery.mockResolvedValue({ data: { shortLink: null } })
    mockMutate.mockResolvedValue(updateSuccess)
  })

  describe('updateJourneyShortLink', () => {
    it('rewrites every QR code that points at the journey through getTo', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow(),
        qrCodeRow({
          id: 'campaignQrCodeId',
          teamId: 'campaignTeamId',
          journeyId: 'campaignJourneyId',
          shortLinkId: 'campaignShortLinkId'
        })
      ])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow({ slug: 'renamed' })
      )

      await updateJourneyShortLink('journeyId', logger)

      expect(prismaMock.qrCode.findMany).toHaveBeenCalledWith({
        where: { toJourneyId: 'journeyId' }
      })
      expect(mockMutate).toHaveBeenCalledTimes(2)
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'shortLinkId',
              to: 'https://example.com/renamed?utm_source=ns-qr-code&utm_campaign=shortLinkId'
            }
          }
        })
      )
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'campaignShortLinkId',
              to: 'https://example.com/renamed?utm_source=ns-qr-code&utm_campaign=campaignShortLinkId'
            }
          }
        })
      )
    })

    it('does nothing when no QR code points at the journey', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([])

      await updateJourneyShortLink('journeyId', logger)

      expect(mockQuery).not.toHaveBeenCalled()
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('logs a row that fails and still rewrites the other rows', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow(),
        qrCodeRow({
          id: 'campaignQrCodeId',
          shortLinkId: 'campaignShortLinkId'
        })
      ])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())
      mockMutate.mockRejectedValueOnce(new Error('gateway down'))

      await expect(
        updateJourneyShortLink('journeyId', logger)
      ).resolves.toBeUndefined()

      expect(mockMutate).toHaveBeenCalledTimes(2)
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          qrCodeId: 'qrCodeId',
          shortLinkId: 'shortLinkId',
          error: expect.objectContaining({ message: 'gateway down' })
        }),
        expect.any(String)
      )
    })

    it('logs a ZodError result and does not throw', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([qrCodeRow()])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())
      mockMutate.mockResolvedValue({
        data: { shortLinkUpdate: { __typename: 'ZodError', message: 'bad' } }
      })

      await expect(
        updateJourneyShortLink('journeyId', logger)
      ).resolves.toBeUndefined()

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          qrCodeId: 'qrCodeId',
          shortLinkId: 'shortLinkId'
        }),
        expect.any(String)
      )
    })
  })

  describe('updateAllShortlinks', () => {
    it('leaves a getTo-built link untouched for a non-route-all domain and a journey outside its collection', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([qrCodeRow()])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
        journeyRow({
          customDomains: [{ name: 'team.org', routeAllTeamJourneys: false }]
        })
      )
      mockQuery.mockResolvedValue(
        shortLinkResult(
          'https://example.com/my-journey?utm_source=ns-qr-code&utm_campaign=shortLinkId'
        )
      )

      const count = await updateAllShortlinks(logger)

      expect(count).toBe(0)
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('rewrites a repointed row and a campaign row pointing at another team journey through getTo', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow({ toJourneyId: 'otherJourneyId' }),
        qrCodeRow({
          id: 'campaignQrCodeId',
          teamId: 'campaignTeamId',
          journeyId: 'campaignJourneyId',
          toJourneyId: 'teamBJourneyId',
          shortLinkId: 'campaignShortLinkId'
        })
      ])
      prismaMock.journey.findUniqueOrThrow
        .mockResolvedValueOnce(journeyRow({ id: 'otherJourneyId', slug: 'a' }))
        .mockResolvedValueOnce(
          journeyRow({
            id: 'teamBJourneyId',
            slug: 'b',
            customDomains: [{ name: 'b.org', routeAllTeamJourneys: true }]
          })
        )

      const count = await updateAllShortlinks(logger)

      expect(prismaMock.qrCode.findMany).toHaveBeenCalledWith()
      expect(count).toBe(2)
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'shortLinkId',
              to: 'https://example.com/a?utm_source=ns-qr-code&utm_campaign=shortLinkId'
            }
          }
        })
      )
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              id: 'campaignShortLinkId',
              to: 'https://b.org/b?utm_source=ns-qr-code&utm_campaign=campaignShortLinkId'
            }
          }
        })
      )
    })

    it('uses the short link id as utm_campaign, not the QR code id', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([qrCodeRow()])
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())

      await updateAllShortlinks(logger)

      const to = mockMutate.mock.calls[0][0].variables.input.to as string
      expect(to).toContain('utm_campaign=shortLinkId')
      expect(to).not.toContain('qrCodeId')
    })

    it('rewrites at most one batch of rows at a time over a single Apollo client', async () => {
      const rowCount = REWRITE_BATCH_SIZE * 2 + 3
      prismaMock.qrCode.findMany.mockResolvedValue(
        Array.from({ length: rowCount }, (_, index) =>
          qrCodeRow({
            id: `qrCodeId${index}`,
            shortLinkId: `shortLinkId${index}`
          })
        )
      )
      prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journeyRow())
      let inFlight = 0
      let maxInFlight = 0
      mockMutate.mockImplementation(async () => {
        inFlight++
        maxInFlight = Math.max(maxInFlight, inFlight)
        await new Promise((resolve) => setTimeout(resolve, 1))
        inFlight--
        return updateSuccess
      })

      const count = await updateAllShortlinks(logger)

      expect(count).toBe(rowCount)
      expect(mockMutate).toHaveBeenCalledTimes(rowCount)
      expect(maxInFlight).toBe(REWRITE_BATCH_SIZE)
      expect(mockApolloClient).toHaveBeenCalledTimes(1)
    })

    it('logs and skips a row whose getTo rejects while rewriting the rest', async () => {
      prismaMock.qrCode.findMany.mockResolvedValue([
        qrCodeRow({ toJourneyId: 'missingJourneyId' }),
        qrCodeRow({
          id: 'qrCodeId2',
          shortLinkId: 'shortLinkId2'
        })
      ])
      prismaMock.journey.findUniqueOrThrow
        .mockRejectedValueOnce(new Error('No Journey found'))
        .mockResolvedValueOnce(journeyRow())

      const count = await updateAllShortlinks(logger)

      expect(count).toBe(1)
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: expect.objectContaining({ id: 'shortLinkId2' })
          }
        })
      )
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          qrCodeId: 'qrCodeId',
          shortLinkId: 'shortLinkId'
        }),
        expect.any(String)
      )
    })
  })
})
