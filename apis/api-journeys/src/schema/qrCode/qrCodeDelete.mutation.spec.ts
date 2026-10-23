import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { deleteShortLink } from './qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./qrCode.service')>()),
  deleteShortLink: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('qrCodeDelete', () => {
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

  const QR_CODE_DELETE = graphql(`
    mutation QrCodeDelete($id: ID!) {
      qrCodeDelete(id: $id) {
        id
      }
    }
  `)

  const qrCode = {
    id: 'qrCodeId',
    teamId: 'teamId',
    journeyId: 'journeyId',
    shortLinkId: 'shortLinkId',
    journey: { template: false, userJourneys: [] },
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.member }] },
    campaignRegionLanguages: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('deletes the short link and the row for a team member', async () => {
    prismaMock.qrCode.findUniqueOrThrow.mockResolvedValue(qrCode as never)
    prismaMock.qrCode.delete.mockResolvedValue({ id: 'qrCodeId' } as never)

    const result = await authClient({
      document: QR_CODE_DELETE,
      variables: { id: 'qrCodeId' }
    })

    expect(result).toEqual({ data: { qrCodeDelete: { id: 'qrCodeId' } } })
    expect(deleteShortLink).toHaveBeenCalledWith('shortLinkId')
    expect(prismaMock.qrCode.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'qrCodeId' } })
    )
  })

  it('refuses a Campaign QR Code for a member of its team, with no delete', async () => {
    prismaMock.qrCode.findUniqueOrThrow.mockResolvedValue({
      ...qrCode,
      campaignRegionLanguages: [{ id: 'regionLanguageId' }]
    } as never)

    const result = (await authClient({
      document: QR_CODE_DELETE,
      variables: { id: 'qrCodeId' }
    })) as any

    expect(result.errors[0].extensions.code).toBe('FORBIDDEN')
    expect(deleteShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.delete).not.toHaveBeenCalled()
  })
})
