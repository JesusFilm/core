import { vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { CampaignFixture, campaignFactory } from './campaignFactory'
import { getClient } from './client'
import { prismaMock } from './prismaMock'

export const mockUser = {
  id: 'userId',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'Test',
  lastName: 'User',
  imageUrl: null,
  roles: []
}

/** An authenticated client for the campaign block mutation specs. */
export const authClient = getClient({
  headers: { authorization: 'token' },
  context: { currentUser: mockUser }
})

/**
 * The shared `beforeEach` of every campaign block mutation spec: the
 * authenticated member (the spec itself mocks `@core/yoga/firebaseClient`),
 * the seeded fixture, and a transaction mock that runs the callback against
 * the Prisma mock.
 */
export function setupCampaignBlockSpec(): CampaignFixture {
  vi.clearAllMocks()
  vi.mocked(getUserFromPayload).mockReturnValue(mockUser)
  prismaMock.userRole.findUnique.mockResolvedValue({
    id: 'userRoleId',
    userId: mockUser.id,
    roles: []
  })
  prismaMock.$transaction.mockImplementation(
    async (callback: any) => await callback(prismaMock)
  )
  const fixture = campaignFactory().build()
  prismaMock.campaign.findUnique.mockResolvedValue(fixture)
  prismaMock.campaign.update.mockResolvedValue(fixture)
  return fixture
}
