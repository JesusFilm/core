import { ExecutionResult } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

interface QrCodeRow {
  id: string
  teamId: string
  journeyId: string
  toJourneyId: string
  toBlockId: string | null
  shortLinkId: string
  shortLinkUrl: string | null
  color: string | null
  backgroundColor: string | null
  campaignRegionLanguages: Array<{ id: string }>
}

function qrCodeRow(overrides: Partial<QrCodeRow>): QrCodeRow {
  return {
    id: 'qrCodeId',
    teamId: 'teamId',
    journeyId: 'journeyId',
    toJourneyId: 'journeyId',
    toBlockId: null,
    shortLinkId: 'shortLinkId',
    shortLinkUrl: null,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    campaignRegionLanguages: [],
    ...overrides
  }
}

describe('qrCodes', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const QR_CODES_QUERY = graphql(`
    query QrCodes($where: QrCodesFilter!) {
      qrCodes(where: $where) {
        id
        toJourneyId
      }
    }
  `)

  // A journey QR Code and a Campaign QR Code of the same team, both pointing
  // at the same journey.
  const journeyQrCode = qrCodeRow({ id: 'journeyQrCodeId' })
  const campaignQrCode = qrCodeRow({
    id: 'campaignQrCodeId',
    shortLinkId: 'campaignShortLinkId',
    shortLinkUrl: 'https://example.com/campaignShortLinkId',
    campaignRegionLanguages: [{ id: 'regionLanguageId' }]
  })

  beforeEach(() => {
    mockGetUserFromPayload.mockReturnValue(mockUser)
    // Apply the resolver's filter to the rows as the database would.
    prismaMock.qrCode.findMany.mockImplementation((async ({
      where
    }: {
      where: Prisma.QrCodeWhereInput
    }) =>
      [journeyQrCode, campaignQrCode].filter(
        (row) =>
          (where.campaignRegionLanguages?.none == null ||
            row.campaignRegionLanguages.length === 0) &&
          (where.journeyId == null || row.journeyId === where.journeyId) &&
          (where.teamId == null || row.teamId === where.teamId)
      )) as never)
  })

  it.each([
    ['journeyId and teamId', { journeyId: 'journeyId', teamId: 'teamId' }],
    ['journeyId', { journeyId: 'journeyId' }],
    ['teamId', { teamId: 'teamId' }],
    ['neither', {}]
  ])(
    'leaves out Campaign QR Codes when filtering by %s',
    async (_label, where) => {
      const result = (await authClient({
        document: QR_CODES_QUERY,
        variables: { where }
      })) as ExecutionResult<{ qrCodes: Array<{ id: string }> }>

      expect(prismaMock.qrCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { campaignRegionLanguages: { none: {} }, ...where }
        })
      )
      expect(result.data?.qrCodes.map(({ id }) => id)).toEqual([
        'journeyQrCodeId'
      ])
    }
  )
})
