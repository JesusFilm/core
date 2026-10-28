import { type MockedFunction, vi } from 'vitest'

import { UserTeamRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockQueueAdd } from '../../../test/bullmqMock'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { updateJourneyShortLink } from '../../workers/shortlinkUpdater/service'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../workers/shortlinkUpdater/service', () => ({
  updateJourneyShortLink: vi.fn().mockResolvedValue(undefined)
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const JOURNEY_UPDATE = graphql(`
  mutation JourneyUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
    }
  }
`)

describe('journeyUpdate', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
  })

  it('rejects a reserved slug as BAD_USER_INPUT without writing', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journeyId',
      teamId: 'teamId',
      userJourneys: [],
      team: {
        id: 'teamId',
        userTeams: [
          { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
        ]
      }
    } as any)

    const result = (await authClient({
      document: JOURNEY_UPDATE,
      variables: { id: 'journeyId', input: { slug: 'template-gallery' } }
    })) as any

    expect(result.errors?.[0]).toMatchObject({
      message: 'slug is reserved',
      extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(prismaMock.journey.update).not.toHaveBeenCalled()
  })

  describe('short link rewrite', () => {
    const journey = {
      id: 'journeyId',
      teamId: 'teamId',
      userJourneys: [],
      team: {
        id: 'teamId',
        userTeams: [
          { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
        ]
      }
    }

    beforeEach(() => {
      prismaMock.journey.findUnique.mockResolvedValue(journey as any)
      prismaMock.$transaction.mockImplementation(
        async (callback: any) => await callback(prismaMock)
      )
      prismaMock.journey.update.mockResolvedValue({
        id: 'journeyId',
        slug: 'new-slug'
      } as any)
    })

    it('rewrites the QR short links after the transaction on a slug change', async () => {
      const order: string[] = []
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const result = await callback(prismaMock)
        order.push('transaction returned')
        return result
      })
      vi.mocked(updateJourneyShortLink).mockImplementation(async () => {
        order.push('updateJourneyShortLink')
      })

      const result = (await authClient({
        document: JOURNEY_UPDATE,
        variables: { id: 'journeyId', input: { slug: 'new-slug' } }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(updateJourneyShortLink).toHaveBeenCalledWith('journeyId')
      expect(order).toEqual(['transaction returned', 'updateJourneyShortLink'])
    })

    it('does not rewrite the QR short links without a slug change', async () => {
      const result = (await authClient({
        document: JOURNEY_UPDATE,
        variables: { id: 'journeyId', input: { title: 'New title' } }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(updateJourneyShortLink).not.toHaveBeenCalled()
    })

    it('does not fail the mutation when the rewrite rejects', async () => {
      vi.mocked(updateJourneyShortLink).mockRejectedValueOnce(
        new Error('gateway down')
      )

      const result = (await authClient({
        document: JOURNEY_UPDATE,
        variables: { id: 'journeyId', input: { slug: 'new-slug' } }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.journeyUpdate.id).toBe('journeyId')
    })
  })

  it('revalidates the SEO change on a team domain, never a Campaign Domain', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journeyId',
      teamId: 'teamId',
      userJourneys: [],
      team: {
        id: 'teamId',
        userTeams: [
          { userId: mockUser.id, teamId: 'teamId', role: UserTeamRole.manager }
        ]
      }
    } as any)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.journey.update.mockResolvedValue({
      id: 'journeyId',
      slug: 'journey-slug',
      team: { customDomains: [{ name: 'team.example.com' }] }
    } as any)

    const result = (await authClient({
      document: JOURNEY_UPDATE,
      variables: { id: 'journeyId', input: { seoTitle: 'New title' } }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(prismaMock.journey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          team: {
            include: { customDomains: { where: { campaignId: null } } }
          }
        })
      })
    )
    expect(mockQueueAdd).toHaveBeenCalledWith('revalidate', {
      slug: 'journey-slug',
      hostname: 'team.example.com',
      fbReScrape: true
    })
  })
})
