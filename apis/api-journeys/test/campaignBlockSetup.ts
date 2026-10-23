import type { ResultOf } from 'gql.tada'
import type { DocumentNode, GraphQLFormattedError } from 'graphql'
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

const authExecutor = getClient({
  headers: { authorization: 'token' },
  context: { currentUser: mockUser }
})

/**
 * The data `TDocument` selects. The subgraph's `graphql()` has no
 * introspection yet, so its documents yield `never` and this falls back to
 * `any`; it narrows by itself once the introspection is wired in.
 */
type DataOf<TDocument> = [ResultOf<TDocument>] extends [never]
  ? any
  : ResultOf<TDocument>

/**
 * The response to `TDocument` as the campaign specs read it: `data` typed by
 * the document, `errors` read only by the cases that expect one.
 */
export interface CampaignSpecResult<TDocument> {
  data: DataOf<TDocument>
  errors: GraphQLFormattedError[]
}

/** Runs `document` as the authenticated member of the campaign specs. */
export async function authClient<TDocument extends DocumentNode>(request: {
  document: TDocument
  variables?: Record<string, unknown>
}): Promise<CampaignSpecResult<TDocument>> {
  return (await authExecutor(
    request
  )) as unknown as CampaignSpecResult<TDocument>
}

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
