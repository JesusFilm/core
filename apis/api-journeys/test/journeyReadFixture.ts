import type { Journey } from '../src/schema/journey/journey.acl'

import { prismaMock } from './prismaMock'

// Write-handler tests stub their initial ACL fetch. Their returned blocks also
// need a readable owning journey when the response is serialized.
export function mockJourneyRead(): void {
  prismaMock.journey.findUnique.mockResolvedValue({
    id: 'journeyId',
    status: 'published',
    template: false,
    firstPublishedAt: new Date('2026-01-01'),
    userJourneys: [{ userId: 'testUserId', role: 'owner' }],
    team: { userTeams: [{ userId: 'testUserId', role: 'manager' }] }
  } as unknown as Journey)
}
