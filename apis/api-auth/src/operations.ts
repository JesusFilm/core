import { z } from 'zod'

import { sameSecret } from '@core/yoga/mcp/readContract'

import type { AuthConfig } from './config'
import {
  AuthorizationChanged,
  type Database,
  audit,
  captureGates
} from './store'

const controls = ['admission', 'effects'] as const
type Control = (typeof controls)[number]
const gateId = (control: Control) => `operations:${control}`

/** These generations travel with the permit before current rights are read.
 * Closing and reopening cannot validate a snapshot from before the stop.
 */
export function captureOperationGates(
  db: Database,
  ids: string[],
  effects = false
) {
  return captureGates(db, [
    ...ids,
    gateId('admission'),
    ...(effects ? [gateId('effects')] : [])
  ])
}

export function assertOperationGates(
  gates: Array<{ id: string; generation: number }>,
  effects = false
): void {
  for (const control of effects ? controls : (['admission'] as const))
    if (!gates.some((gate) => gate.id === gateId(control)))
      throw new AuthorizationChanged('Participant upgrade required')
}

/** Operator credentials cannot read data, accept work or assert executor fences.
 * Updating a gate never changes an accepted permit or a withdrawal state.
 */
export function createOperations(config: AuthConfig, db: Database) {
  return async (authorization: string, body: unknown) => {
    if (
      !config.AUTH_OPERATIONS_SECRET ||
      !sameSecret(authorization, `Bearer ${config.AUTH_OPERATIONS_SECRET}`)
    )
      throw new Error('Operator denied')
    const input = z
      .discriminatedUnion('action', [
        z.object({ action: z.literal('status') }).strict(),
        z
          .object({
            action: z.literal('set'),
            control: z.enum(controls),
            enabled: z.boolean(),
            expectedGeneration: z.number().int().nonnegative().max(2147483646)
          })
          .strict()
      ])
      .parse(body)
    for (const control of controls)
      await db.authorizationGate.upsert({
        where: { id: gateId(control) },
        create: { id: gateId(control) },
        update: {}
      })
    if (input.action === 'set')
      await db.$transaction(async (tx) => {
        const updated = await tx.authorizationGate.updateMany({
          where: {
            id: gateId(input.control),
            generation: input.expectedGeneration
          },
          data: { open: input.enabled, generation: { increment: 1 } }
        })
        if (updated.count !== 1)
          throw new AuthorizationChanged('Refresh control state')
        await audit(tx, 'operations_change', 'allowed')
      })
    return db.$transaction(
      async (tx) => ({
        controls: await Promise.all(
          controls.map(async (control) => {
            const gate = await tx.authorizationGate.findUniqueOrThrow({
              where: { id: gateId(control) }
            })
            return { control, enabled: gate.open, generation: gate.generation }
          })
        ),
        accepted: await tx.readPermit.groupBy({
          by: ['executor', 'stage'],
          where: { status: 'accepted' },
          _count: { _all: true }
        }),
        pendingChanges: await tx.connectionChange.count({
          where: { status: 'pending' }
        })
      }),
      { isolationLevel: 'RepeatableRead' }
    )
  }
}
