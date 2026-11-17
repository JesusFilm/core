import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { Prisma } from '@core/prisma/journeys/client'
import { type HistoryResult, historyResult } from '@core/yoga/mcp/editContract'

type Block = Prisma.BlockGetPayload<Record<string, never>>

/** Both forward edits and inverses resolve the actual live owning chain. */
export async function typographyParents(
  tx: Prisma.TransactionClient,
  journeyId: string,
  block: Block
): Promise<{ cardId: string; stepId: string }> {
  if (block.typename !== 'TypographyBlock' || !block.parentBlockId)
    throw new Error('HISTORY_CONFLICT')
  const card = await tx.block.findUnique({
    where: { id: block.parentBlockId, journeyId, deletedAt: null }
  })
  const step = card?.parentBlockId
    ? await tx.block.findUnique({
        where: { id: card.parentBlockId, journeyId, deletedAt: null }
      })
    : null
  if (
    card?.typename !== 'CardBlock' ||
    step?.typename !== 'StepBlock' ||
    step.parentBlockId !== null ||
    (await tx.block.count({
      where: {
        journeyId,
        parentBlockId: step.id,
        typename: 'CardBlock',
        deletedAt: null
      }
    })) !== 1
  )
    throw new Error('HISTORY_CONFLICT')
  return { cardId: card.id, stepId: step.id }
}

// Persisted descriptors are internal, versioned by their discriminant. Neither
// clients nor generic field names can introduce writes into this closed union.
const typographyInverse = z
  .object({
    type: z.literal('typography_restore'),
    blockId: z.string(),
    parent: z.object({ cardId: z.string(), stepId: z.string() }).strict(),
    fields: z
      .array(
        z
          .object({
            field: z.enum(['content', 'variant', 'align', 'settings.color']),
            before: z.json(),
            after: z.string(),
            beforePresent: z.boolean()
          })
          .strict()
      )
      .min(1)
      .max(4)
  })
  .strict()

export async function historyEntries(
  tx: Prisma.TransactionClient,
  namespaceId: string,
  journeyId: string,
  historyGeneration: number
) {
  return tx.mcpEditHistory.findMany({
    where: { namespaceId, journeyId, historyGeneration },
    orderBy: { ordinal: 'asc' },
    take: 5
  })
}

export function describeHistory(
  journeyId: string,
  revision: string,
  entries: Awaited<ReturnType<typeof historyEntries>>,
  canWrite: boolean
): HistoryResult {
  return historyResult.parse({
    contractVersion: '1',
    kind: 'journey_history',
    journeyId,
    revision,
    undoEntryId: canWrite
      ? ([...entries].reverse().find((entry) => !entry.undone)?.id ?? null)
      : null,
    redoEntryId: canWrite
      ? (entries.find((entry) => entry.undone)?.id ?? null)
      : null,
    entries: entries.map((entry) => ({
      entryId: entry.id,
      operationId: entry.operationId,
      label: 'Typography edit',
      state: entry.undone ? 'redo' : 'undo',
      createdAt: entry.createdAt.toISOString()
    }))
  })
}

/** Plan the complete batch before writing. Repeated targets use projected
 * state, in reverse command order for undo and forward order for redo.
 */
export async function planHistory(
  tx: Prisma.TransactionClient,
  journeyId: string,
  changes: unknown,
  direction: 'undo' | 'redo'
) {
  const parsed = z.array(typographyInverse).min(1).max(50).safeParse(changes)
  if (!parsed.success) throw new Error('HISTORY_UNAVAILABLE')
  const inverses =
    direction === 'undo' ? [...parsed.data].reverse() : parsed.data
  const projected = new Map<string, Block>()
  const plans: Array<{
    blockId: string
    patch: Prisma.BlockUpdateInput
    fields: Array<'content' | 'variant' | 'align' | 'settings.color'>
  }> = []
  for (const inverse of inverses) {
    const block =
      projected.get(inverse.blockId) ??
      (await tx.block.findUnique({
        where: { id: inverse.blockId, journeyId, deletedAt: null }
      }))
    if (!block) throw new Error('HISTORY_CONFLICT')
    const parent = await typographyParents(tx, journeyId, block)
    if (!isDeepStrictEqual(parent, inverse.parent))
      throw new Error('HISTORY_CONFLICT')
    const next = { ...block }
    const patch: Prisma.BlockUpdateInput = {}
    for (const field of inverse.fields) {
      const expected = direction === 'undo' ? field.after : field.before
      const value = direction === 'undo' ? field.before : field.after
      if (field.field === 'settings.color') {
        if (
          next.settings !== null &&
          (typeof next.settings !== 'object' || Array.isArray(next.settings))
        )
          throw new Error('HISTORY_CONFLICT')
        const settings = { ...(next.settings ?? {}) } as Prisma.JsonObject
        const present = Object.prototype.hasOwnProperty.call(settings, 'color')
        const expectedPresent = direction === 'undo' || field.beforePresent
        if (
          present !== expectedPresent ||
          (present && !isDeepStrictEqual(settings.color, expected))
        )
          throw new Error('HISTORY_CONFLICT')
        if (direction === 'undo' && !field.beforePresent) delete settings.color
        else settings.color = value
        next.settings = settings
        patch.settings = settings as Prisma.InputJsonObject
      } else {
        if (
          !field.beforePresent ||
          (value !== null && typeof value !== 'string')
        )
          throw new Error('HISTORY_UNAVAILABLE')
        if (!isDeepStrictEqual(next[field.field], expected))
          throw new Error('HISTORY_CONFLICT')
        next[field.field] = value
        patch[field.field] = value
      }
    }
    projected.set(block.id, next)
    plans.push({
      blockId: block.id,
      patch,
      fields: inverse.fields.map(({ field }) => field)
    })
  }
  return plans
}
