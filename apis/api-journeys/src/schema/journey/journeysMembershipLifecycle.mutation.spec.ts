import { type MockedFunction, vi } from 'vitest'

import {
  JourneyStatus,
  Prisma,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({ getUserFromPayload: vi.fn() }))
const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const ARCHIVE = graphql(`
  mutation ArchiveWithMemberships($ids: [ID!]!) {
    journeysArchive(ids: $ids) {
      id
      status
    }
  }
`)
const TRASH = graphql(`
  mutation TrashWithMemberships($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
    }
  }
`)
const user = {
  id: 'userId',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'Test',
  lastName: 'User',
  imageUrl: null,
  roles: []
}
const client = getClient({
  headers: { authorization: 'token' },
  context: { currentUser: user }
})
type JourneyWithAccess = Prisma.JourneyGetPayload<{
  include: { userJourneys: true; team: { include: { userTeams: true } } }
}>
const journey = {
  id: 'journey-1',
  teamId: 'team-1',
  template: true,
  updatedAt: new Date('2026-05-01'),
  userJourneys: [],
  team: { userTeams: [{ userId: user.id, role: UserTeamRole.manager }] }
} as unknown as JourneyWithAccess

describe.each([
  {
    action: 'archive',
    document: ARCHIVE,
    field: 'journeysArchive',
    status: JourneyStatus.archived
  },
  {
    action: 'trash',
    document: TRASH,
    field: 'journeysTrash',
    status: JourneyStatus.trashed
  }
])('$action collection membership cleanup', ({ document, field, status }) => {
  beforeEach(() => {
    mockGetUserFromPayload.mockReturnValue(user)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'role',
      userId: user.id,
      roles: []
    })
    prismaMock.journey.findMany.mockResolvedValue([journey])
    prismaMock.journey.update.mockResolvedValue({ ...journey, status })
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
        await callback(prismaMock)
    )
    prismaMock.templateGalleryPageTemplate.findMany
      .mockResolvedValueOnce([
        { templateGalleryPageId: 'page-B' },
        { templateGalleryPageId: 'page-A' }
      ] as Prisma.TemplateGalleryPageTemplateGetPayload<
        Record<string, never>
      >[])
      .mockResolvedValue([])
  })

  it('clears every membership in the same transaction as the status change', async () => {
    const result = await client({ document, variables: { ids: [journey.id] } })
    expect(result).toEqual({ data: { [field]: [{ id: journey.id, status }] } })
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({
      where: {
        journeyId: journey.id,
        templateGalleryPageId: { in: ['page-A', 'page-B'] }
      }
    })
    const lockCalls = prismaMock.$queryRaw.mock.calls
    expect((lockCalls[0][0] as readonly string[]).join(' ')).toContain(
      'FROM "Journey"'
    )
    expect(lockCalls.slice(1).map((call) => call[1])).toEqual([
      'page-A',
      'page-B'
    ])
    expect(prismaMock.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.journey.update.mock.invocationCallOrder[0]
    )
  })

  it('fails the lifecycle mutation when collection cleanup fails', async () => {
    prismaMock.templateGalleryPageTemplate.deleteMany.mockRejectedValue(
      new Error('membership cleanup failed')
    )
    const result = await client({ document, variables: { ids: [journey.id] } })
    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({ message: 'membership cleanup failed' })
      ]
    })
  })
})
