import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { updateShortLink } from './qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./qrCode.service')>()),
  updateShortLink: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('qrCodeUpdate', () => {
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

  const QR_CODE_UPDATE = graphql(`
    mutation QrCodeUpdate($id: ID!, $input: QrCodeUpdateInput!) {
      qrCodeUpdate(id: $id, input: $input) {
        id
        toJourneyId
        color
      }
    }
  `)

  const qrCode = {
    id: 'qrCodeId',
    teamId: 'teamId',
    journeyId: 'journeyId',
    toJourneyId: 'journeyId',
    toBlockId: 'oldBlockId',
    shortLinkId: 'shortLinkId',
    journey: { template: false, userJourneys: [] },
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.member }] },
    campaignRegionLanguages: []
  }

  const targetJourney = {
    id: 'targetJourneyId',
    slug: 'christmas-europe',
    teamId: 'teamId',
    team: { id: 'teamId', customDomains: [] },
    journeyCollectionJourneys: []
  }

  async function update(input: {
    to?: string
    color?: string
    backgroundColor?: string
  }): Promise<any> {
    return await authClient({
      document: QR_CODE_UPDATE,
      variables: { id: 'qrCodeId', input }
    })
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
    prismaMock.qrCode.findUniqueOrThrow.mockResolvedValue(qrCode as never)
    prismaMock.qrCode.update.mockResolvedValue({
      id: 'qrCodeId',
      toJourneyId: 'journeyId',
      color: '#ff0000'
    } as never)
    prismaMock.journey.findFirst.mockResolvedValue(targetJourney as never)
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue(
      targetJourney as never
    )
  })

  it('updates the colours without touching the short link', async () => {
    const result = await update({ color: '#ff0000', backgroundColor: '#fff' })

    expect(result.errors).toBeUndefined()
    expect(updateShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'qrCodeId' },
        data: { color: '#ff0000', backgroundColor: '#fff' }
      })
    )
  })

  it('repoints the short link and the row for a pasted URL', async () => {
    prismaMock.block.findFirst.mockResolvedValue({ id: 'blockId' } as never)
    prismaMock.block.findUniqueOrThrow.mockResolvedValue({
      id: 'blockId'
    } as never)

    const result = await update({
      to: 'https://example.com/christmas-europe/blockId'
    })

    expect(result.errors).toBeUndefined()
    expect(updateShortLink).toHaveBeenCalledWith({
      id: 'shortLinkId',
      to: 'https://example.com/christmas-europe/blockId?utm_source=ns-qr-code&utm_campaign=shortLinkId'
    })
    expect(prismaMock.qrCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { toJourneyId: 'targetJourneyId', toBlockId: 'blockId' }
      })
    )
  })

  it('clears the block when the pasted URL has none', async () => {
    await update({ to: 'https://example.com/christmas-europe' })

    expect(updateShortLink).toHaveBeenCalledWith({
      id: 'shortLinkId',
      to: 'https://example.com/christmas-europe?utm_source=ns-qr-code&utm_campaign=shortLinkId'
    })
    expect(prismaMock.qrCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { toJourneyId: 'targetJourneyId', toBlockId: null }
      })
    )
  })

  it('refuses a trashed own-team journey', async () => {
    prismaMock.journey.findFirst.mockResolvedValue(null)

    const result = await update({ to: 'https://example.com/christmas-europe' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'to'
    })
    expect(prismaMock.journey.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ trashedAt: null, deletedAt: null })
      })
    )
    expect(updateShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.update).not.toHaveBeenCalled()
  })

  it('answers BAD_USER_INPUT on to for an unknown slug', async () => {
    prismaMock.journey.findFirst.mockResolvedValue(null)

    const result = await update({ to: 'https://example.com/unknown-slug' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'to'
    })
    expect(updateShortLink).not.toHaveBeenCalled()
  })

  it('answers BAD_USER_INPUT on to for a non-URL', async () => {
    const result = await update({ to: 'not a url' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'to'
    })
    expect(updateShortLink).not.toHaveBeenCalled()
  })

  it('refuses a Campaign QR Code for a member of its team', async () => {
    prismaMock.qrCode.findUniqueOrThrow.mockResolvedValue({
      ...qrCode,
      campaignRegionLanguages: [{ id: 'regionLanguageId' }]
    } as never)

    const result = await update({ to: 'https://example.com/christmas-europe' })

    expect(result.errors[0].extensions.code).toBe('FORBIDDEN')
    expect(updateShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.update).not.toHaveBeenCalled()
  })
})
