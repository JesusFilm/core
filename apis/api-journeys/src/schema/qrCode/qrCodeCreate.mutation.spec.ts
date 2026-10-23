import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { createShortLink } from './qrCode.service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./qrCode.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./qrCode.service')>()),
  createShortLink: vi.fn(),
  getShortLinkDomain: vi.fn().mockReturnValue('link.example.com')
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const mockCreateShortLink = createShortLink as MockedFunction<
  typeof createShortLink
>

describe('qrCodeCreate', () => {
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

  const QR_CODE_CREATE = graphql(`
    mutation QrCodeCreate($input: QrCodeCreateInput!) {
      qrCodeCreate(input: $input) {
        id
        toJourneyId
      }
    }
  `)

  const journey = {
    id: 'journeyId',
    slug: 'christmas-europe',
    teamId: 'teamId',
    team: {
      id: 'teamId',
      customDomains: [],
      userTeams: [{ userId: 'userId', role: UserTeamRole.member }]
    },
    userJourneys: [],
    journeyCollectionJourneys: []
  }

  async function create(teamId = 'teamId'): Promise<any> {
    return await authClient({
      document: QR_CODE_CREATE,
      variables: { input: { teamId, journeyId: 'journeyId' } }
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
    prismaMock.journey.findUnique.mockResolvedValue(journey as never)
    prismaMock.journey.findUniqueOrThrow.mockResolvedValue(journey as never)
    mockCreateShortLink.mockImplementation(async ({ id }) => ({
      id,
      shortUrl: `https://short.example.org/${id}`
    }))
    prismaMock.qrCode.create.mockResolvedValue({
      id: 'qrCodeId',
      toJourneyId: 'journeyId'
    } as never)
  })

  it('creates the short link with the getTo target and the row with the journey team for a team member', async () => {
    const result = await create()

    expect(result).toEqual({
      data: { qrCodeCreate: { id: 'qrCodeId', toJourneyId: 'journeyId' } }
    })
    const { id: shortLinkId } = mockCreateShortLink.mock.calls[0][0]
    expect(mockCreateShortLink).toHaveBeenCalledWith({
      id: shortLinkId,
      hostname: 'link.example.com',
      to: `https://example.com/christmas-europe?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`,
      service: 'apiJourneys'
    })
    expect(prismaMock.qrCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          teamId: 'teamId',
          journeyId: 'journeyId',
          toJourneyId: 'journeyId',
          shortLinkId
        }
      })
    )
  })

  it('refuses a caller with no rights before creating a short link', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      ...journey,
      team: { ...journey.team, userTeams: [] }
    } as never)

    const result = await create()

    expect(result.errors[0].extensions.code).toBe('FORBIDDEN')
    expect(mockCreateShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.create).not.toHaveBeenCalled()
  })

  it("refuses a teamId that is not the journey's team (BAD_USER_INPUT, field teamId)", async () => {
    const result = await create('otherTeamId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'teamId'
    })
    expect(mockCreateShortLink).not.toHaveBeenCalled()
    expect(prismaMock.qrCode.create).not.toHaveBeenCalled()
  })

  it('answers NOT_FOUND for an unknown journeyId', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await create()

    expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
    expect(mockCreateShortLink).not.toHaveBeenCalled()
  })
})
