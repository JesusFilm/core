import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { Prisma } from '@core/prisma/journeys/client'
import { type HistoryResult, historyResult } from '@core/yoga/mcp/editContract'
import {
  createdInverse,
  deriveSubmitRole,
  presentationInverse,
  settingsObject
} from '@core/yoga/mcp/presentationContract'

import {
  type ContentPlan,
  assertOwnedButtonIcon,
  checkCardLayout,
  contentParents,
  contentSiblings,
  createdState
} from './mcpContent'

type Block = Prisma.BlockGetPayload<Record<string, never>>

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
      label:
        Array.isArray(entry.changes) &&
        entry.changes.every(
          (change) =>
            change !== null &&
            typeof change === 'object' &&
            !Array.isArray(change) &&
            change.type === 'typography_restore'
        )
          ? 'Typography edit'
          : 'Content and presentation edit',
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
  direction: 'undo' | 'redo',
  canEditChat: () => Promise<boolean>
) {
  const parsed = z
    .array(z.union([typographyInverse, presentationInverse, createdInverse]))
    .min(1)
    .max(10000)
    .safeParse(changes)
  if (!parsed.success) throw new Error('HISTORY_UNAVAILABLE')
  const inverses =
    direction === 'undo' ? [...parsed.data].reverse() : parsed.data
  const projected = new Map<string, Block>()
  const plans: ContentPlan[] = []
  for (const inverse of inverses) {
    if (inverse.type === 'content_created') {
      const card = await tx.block.findUnique({
        where: { id: inverse.parent.cardId, journeyId, deletedAt: null }
      })
      if (
        !card ||
        !isDeepStrictEqual(
          await contentParents(tx, journeyId, card),
          inverse.parent
        )
      )
        throw new Error('HISTORY_CONFLICT')
      const ids = inverse.blocks.map(({ id }) => id)
      if (direction === 'undo') {
        const references = await tx.block.findMany({
          where: {
            journeyId,
            deletedAt: null,
            OR: [
              { parentBlockId: { in: ids } },
              { startIconId: { in: ids } },
              { endIconId: { in: ids } },
              { submitIconId: { in: ids } },
              { nextBlockId: { in: ids } },
              { coverBlockId: { in: ids } },
              { posterBlockId: { in: ids } },
              { pollOptionImageBlockId: { in: ids } }
            ]
          }
        })
        const affected = new Set(ids)
        for (const reference of references) {
          const current = projected.get(reference.id) ?? reference
          if (affected.has(current.id) || current.deletedAt) continue
          if (
            [
              current.parentBlockId,
              current.startIconId,
              current.endIconId,
              current.submitIconId,
              current.nextBlockId,
              current.coverBlockId,
              current.posterBlockId,
              current.pollOptionImageBlockId
            ].some((id) => id !== null && affected.has(id))
          )
            throw new Error('HISTORY_CONFLICT')
        }
        if (
          await tx.action.count({
            where: {
              OR: [{ parentBlockId: { in: ids } }, { blockId: { in: ids } }]
            }
          })
        )
          throw new Error('HISTORY_CONFLICT')
      }
      for (const item of inverse.blocks) {
        const block =
          projected.get(item.id) ??
          (await tx.block.findUnique({ where: { id: item.id, journeyId } }))
        if (
          !block ||
          (direction === 'undo'
            ? block.deletedAt !== null
            : block.deletedAt === null) ||
          !isDeepStrictEqual(createdState(block), item.state)
        )
          throw new Error('HISTORY_CONFLICT')
        if (direction === 'redo' && block.parentOrder !== null) {
          const siblings = await tx.block.findMany({
            where: {
              journeyId,
              parentBlockId: block.parentBlockId,
              deletedAt: null
            }
          })
          const currentSiblings = new Map(
            siblings.map((sibling) => [sibling.id, sibling])
          )
          for (const [id, state] of projected)
            if (state.parentBlockId === block.parentBlockId)
              currentSiblings.set(id, state)
          if (
            [...currentSiblings.values()].some(
              (sibling) =>
                sibling.id !== block.id &&
                !sibling.deletedAt &&
                sibling.parentOrder === block.parentOrder
            )
          )
            throw new Error('HISTORY_CONFLICT')
        }
        if (direction === 'redo' && block.typename === 'ButtonBlock' && block.submitEnabled === true) {
          const siblings = await contentSiblings(tx, journeyId, inverse.parent.cardId, projected)
          if (!deriveSubmitRole('create', siblings.filter((sibling) => sibling.id !== block.id)))
            throw new Error('HISTORY_CONFLICT')
        }
        const deletedAt = direction === 'undo' ? new Date() : null
        projected.set(block.id, { ...block, deletedAt })
        plans.push({
          blockId: block.id,
          patch: { deletedAt },
          fields: [direction === 'undo' ? 'deleted' : 'created']
        })
      }
      continue
    }
    const block =
      projected.get(inverse.blockId) ??
      (await tx.block.findUnique({
        where: { id: inverse.blockId, journeyId, deletedAt: null }
      }))
    if (!block || block.deletedAt) throw new Error('HISTORY_CONFLICT')
    if (
      inverse.type === 'presentation_restore' &&
      inverse.gate &&
      !(await canEditChat())
    )
      throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
    let owningBlock = block
    if (inverse.type === 'presentation_restore' && inverse.owner) {
      const owner =
        projected.get(inverse.owner.blockId) ??
        (await tx.block.findUnique({
          where: { id: inverse.owner.blockId, journeyId, deletedAt: null }
        }))
      if (
        !owner ||
        owner.typename !== 'ButtonBlock' ||
        owner[inverse.owner.slot] !== block.id ||
        block.parentBlockId !== owner.id
      )
        throw new Error('HISTORY_CONFLICT')
      owningBlock = owner
      await assertOwnedButtonIcon(tx, owner, block, projected)
    }
    if (
      block.typename !==
      (inverse.type === 'typography_restore'
        ? 'TypographyBlock'
        : inverse.typename)
    )
      throw new Error('HISTORY_CONFLICT')
    const parent = await contentParents(tx, journeyId, owningBlock)
    if (!isDeepStrictEqual(parent, inverse.parent))
      throw new Error('HISTORY_CONFLICT')
    const next = { ...block }
    const patch: Record<string, unknown> = {}
    for (const field of inverse.fields) {
      const expected = direction === 'undo' ? field.after : field.before
      const value = direction === 'undo' ? field.before : field.after
      if (field.field.startsWith('settings.')) {
        if (
          next.settings !== null &&
          (typeof next.settings !== 'object' || Array.isArray(next.settings))
        )
          throw new Error('HISTORY_CONFLICT')
        const settings = { ...settingsObject(next.settings) }
        const key = field.field.slice(9)
        const present = Object.prototype.hasOwnProperty.call(settings, key)
        const expectedPresent = direction === 'undo' || field.beforePresent
        if (
          present !== expectedPresent ||
          (present && !isDeepStrictEqual(settings[key], expected))
        )
          throw new Error('HISTORY_CONFLICT')
        if (direction === 'undo' && !field.beforePresent) delete settings[key]
        else settings[key] = value
        next.settings = settings as Prisma.JsonObject
        patch.settings = settings
      } else {
        if (!field.beforePresent) throw new Error('HISTORY_UNAVAILABLE')
        if (
          !isDeepStrictEqual(
            (next as Record<string, unknown>)[field.field],
            expected
          )
        )
          throw new Error('HISTORY_CONFLICT')
        ;(next as Record<string, unknown>)[field.field] = value
        patch[field.field] = value
      }
    }
    projected.set(block.id, next)
    if (block.typename === 'CardBlock')
      await checkCardLayout(tx, journeyId, block.id, patch.fullscreen)
    plans.push({
      blockId: block.id,
      patch: patch,
      fields: inverse.fields.map(({ field }) => field),
      ...(inverse.type === 'presentation_restore' && inverse.gate
        ? { gate: inverse.gate }
        : {})
    })
  }
  return plans
}
