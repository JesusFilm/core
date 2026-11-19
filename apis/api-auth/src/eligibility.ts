import type { Identity, ReadEligibility } from './identity'
import {
  AuthorizationChanged,
  type Database,
  type IdentityEvidence,
  captureGates
} from './store'

interface EligibilityRequest {
  token: string
  evidence: IdentityEvidence
  journeyIds: string[]
  gates: Array<{ id: string; generation: number }>
  allowPending?: boolean
}

export function createEligibilityReader(
  db: Database,
  identity: Identity,
  eligibility: ReadEligibility
) {
  return async ({
    token,
    evidence,
    journeyIds,
    gates,
    allowPending = false
  }: EligibilityRequest) => {
    const pending = new Set<string>()
    async function capture(id: string, gateIds: string[]) {
      try {
        gates.push(...(await captureGates(db, gateIds)))
      } catch (error) {
        if (!allowPending || !(error instanceof AuthorizationChanged))
          throw error
        pending.add(id)
      }
    }
    for (const id of [...new Set(journeyIds)].sort())
      await capture(id, [`user-journey:${evidence.userId}:${id}`])
    await identity.check(evidence)
    // Discover ownership, then discard this read's permission result. Capture
    // membership generations before the authoritative permission read.
    const discovered = await eligibility(token, evidence.userId)
    for (const journey of discovered.filter((journey) =>
      journeyIds.includes(journey.id)
    )) {
      await capture(journey.id, [
        `team:${journey.teamId}`,
        `user-team:${evidence.userId}:${journey.teamId}`
      ])
    }
    await identity.check(evidence)
    const current = await eligibility(token, evidence.userId)
    const journeys = current.filter(
      (journey) => journeyIds.includes(journey.id) && !pending.has(journey.id)
    )
    if (
      journeys.some(
        (journey) =>
          !discovered.some(
            (previous) =>
              previous.id === journey.id && previous.teamId === journey.teamId
          )
      )
    )
      throw new AuthorizationChanged('Journey ownership changed')
    return { journeys, pending }
  }
}
