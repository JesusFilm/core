import { expect } from 'vitest'

import { prismaMock } from './prismaMock'

/**
 * The transaction's first `$queryRaw` is the campaign's structure lock
 * (`lockCampaignStructure`): `pg_advisory_xact_lock` on `campaign:<id>`.
 */
export function expectStructureLockFirst(campaignId = 'campaignId'): void {
  const [strings, key] = prismaMock.$queryRaw.mock.calls[0] as unknown as [
    string[],
    string
  ]
  expect(strings.join('?')).toContain('pg_advisory_xact_lock(hashtext(')
  expect(key).toBe(`campaign:${campaignId}`)
}
