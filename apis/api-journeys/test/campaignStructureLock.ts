import { expect } from 'vitest'

import { prismaMock } from './prismaMock'

/**
 * The transaction's first `$executeRaw` is the campaign's structure lock
 * (`lockCampaignStructure`): `pg_advisory_xact_lock` on `campaign:<id>`. It
 * runs through `$executeRaw` because the function returns `void`, so the row
 * locks (`SELECT 1 … FOR UPDATE`) are the transaction's only `$queryRaw` calls.
 */
export function expectStructureLockFirst(campaignId = 'campaignId'): void {
  const [strings, key] = prismaMock.$executeRaw.mock.calls[0] as unknown as [
    string[],
    string
  ]
  expect(strings.join('?')).toContain('pg_advisory_xact_lock(hashtext(')
  expect(key).toBe(`campaign:${campaignId}`)
}
