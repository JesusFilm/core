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
      title
    }
  }
`)
const TRASH = graphql(`
  mutation TrashWithMemberships($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
      title
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
  title: 'A template journey',
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
    expect(result).toEqual({
      data: { [field]: [{ id: journey.id, status, title: journey.title }] }
    })
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
    expect(prismaMock.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.templateGalleryPageTemplate.findMany.mock
        .invocationCallOrder[0]
    )
    const update = prismaMock.journey.update.mock.calls[0][0]
    expect(update.where).toEqual({
      id: journey.id,
      updatedAt: journey.updatedAt
    })
    expect(update.data).toEqual({
      status,
      updatedAt: journey.updatedAt,
      ...(status === JourneyStatus.archived
        ? { archivedAt: expect.any(Date) }
        : { trashedAt: expect.any(Date) })
    })
  })

  it('skips journeys the caller cannot manage', async () => {
    const unmanageableJourney = {
      ...journey,
      team: { ...journey.team, userTeams: [] }
    }
    prismaMock.journey.findMany.mockResolvedValue([unmanageableJourney])
    const result = await client({ document, variables: { ids: [journey.id] } })
    expect(result).toEqual({ data: { [field]: [] } })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).not.toHaveBeenCalled()
  })

  it('changes only manageable journeys from a mixed selection', async () => {
    const other = {
      ...journey,
      id: 'another-journey',
      team: { ...journey.team, userTeams: [] }
    }
    prismaMock.journey.findMany.mockResolvedValue([journey, other])
    const result = await client({
      document,
      variables: { ids: [journey.id, other.id] }
    })
    expect(result).toEqual({
      data: { [field]: [{ id: journey.id, status, title: journey.title }] }
    })
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(prismaMock.journey.update).toHaveBeenCalledTimes(1)
    expect(prismaMock.journey.update.mock.calls[0][0].where.id).toBe(journey.id)
  })

  it('leaves memberships untouched when the status update fails', async () => {
    prismaMock.journey.update.mockRejectedValue(new Error('concurrent edit'))
    const result = await client({ document, variables: { ids: [journey.id] } })
    expect(result).toEqual({
      data: null,
      errors: [expect.objectContaining({ message: 'concurrent edit' })]
    })
    expect(
      prismaMock.templateGalleryPageTemplate.findMany
    ).not.toHaveBeenCalled()
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).not.toHaveBeenCalled()
  })

  it('changes status without collection writes when there are no memberships', async () => {
    prismaMock.templateGalleryPageTemplate.findMany.mockReset()
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([])
    const result = await client({ document, variables: { ids: [journey.id] } })
    expect(result).toEqual({
      data: { [field]: [{ id: journey.id, status, title: journey.title }] }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).not.toHaveBeenCalled()
    expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
  })

  it('keeps a separate transaction for each manageable journey', async () => {
    const other = {
      ...journey,
      id: 'another-journey',
      title: 'Another template'
    }
    prismaMock.journey.findMany.mockResolvedValue([journey, other])
    prismaMock.journey.update
      .mockResolvedValueOnce({ ...journey, status })
      .mockResolvedValueOnce({ ...other, status })
    const result = await client({
      document,
      variables: { ids: [journey.id, other.id] }
    })
    expect(result).toEqual({
      data: {
        [field]: [
          { id: journey.id, status, title: journey.title },
          { id: other.id, status, title: other.title }
        ]
      }
    })
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(2)
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
