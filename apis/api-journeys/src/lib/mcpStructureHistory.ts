import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { Prisma } from '@core/prisma/journeys/client'

import {
  type ActionField,
  type BlockChangeField,
  type BlockState,
  type Scalar,
  actionFields,
  blockFields,
  finishStructure,
  idOf,
  live,
  loadStructure,
  parentOf,
  requiredString,
  serialize,
  siblingsFrom,
  structureInverseSchema
} from './mcpStructureState'

function conflict(): never {
  throw new Error('HISTORY_CONFLICT')
}
function settings(row: BlockState): Record<string, Scalar> {
  if (row.settings === null) return {}
  if (typeof row.settings !== 'object' || Array.isArray(row.settings))
    conflict()
  return row.settings
}
function equalField(
  current: BlockState,
  expected: BlockState,
  field: BlockChangeField
): boolean {
  if (field !== 'settings.color')
    return isDeepStrictEqual(current[field], expected[field])
  const a = settings(current),
    b = settings(expected)
  return (
    Object.prototype.hasOwnProperty.call(a, 'color') ===
      Object.prototype.hasOwnProperty.call(b, 'color') &&
    isDeepStrictEqual(a.color, b.color)
  )
}
function setField(
  current: BlockState,
  value: BlockState,
  field: BlockChangeField
): void {
  if (field !== 'settings.color') {
    current[field] = serialize(value[field])
    return
  }
  const next = { ...settings(current) },
    source = settings(value)
  if (Object.prototype.hasOwnProperty.call(source, 'color'))
    next.color = source.color
  else delete next.color
  current.settings = next
}

/** Restores only recorded owned changes. Soft-deleted rows are deliberately
 * read here to restore the same IDs; they are never exposed as live content. */
export async function planStructureHistory(
  tx: Prisma.TransactionClient,
  journey: {
    id: string
    website: boolean | null
    menuStepBlockId: string | null
    socialNodeX: number | null
    socialNodeY: number | null
  },
  changes: unknown,
  direction: 'undo' | 'redo'
) {
  const parsed = z.array(structureInverseSchema).length(1).safeParse(changes)
  if (!parsed.success) throw new Error('HISTORY_UNAVAILABLE')
  const inverse = parsed.data[0],
    state = await loadStructure(tx, journey, true)
  const expectedSide = direction === 'undo' ? 'after' : 'before',
    nextSide = direction === 'undo' ? 'before' : 'after'
  for (const dependency of inverse.owners) {
    const row = state.blocks.get(dependency.id)
    if (
      !row ||
      row.typename !== dependency.typename ||
      row.parentBlockId !== dependency.parentBlockId ||
      row.journeyId !== journey.id
    )
      conflict()
  }
  for (const sibling of inverse.siblings) {
    if (
      !isDeepStrictEqual(
        siblingsFrom(state.blocks, sibling.parentBlockId),
        sibling[expectedSide]
      )
    )
      conflict()
  }
  const createdIds = new Set(
    inverse.blocks.filter((change) => change.created).map((change) => change.id)
  )
  for (const id of createdIds)
    if (
      state.actions.has(id) &&
      !inverse.actions.some((change) => change.id === id)
    )
      conflict()
  const removedIds = new Set(
    inverse.blocks
      .filter(
        (change) =>
          change.fields.includes('deletedAt') &&
          change.before.deletedAt === null &&
          change.after.deletedAt !== null
      )
      .map((change) => change.id)
  )
  for (const change of inverse.blocks) {
    if (change.fields.includes('slug') && journey.website !== true) conflict()
    const row = state.blocks.get(change.id),
      expected = change[expectedSide],
      next = change[nextSide]
    if (
      !row ||
      row.typename !== change.typename ||
      row.parentBlockId !== change.parentBlockId ||
      row.journeyId !== journey.id
    )
      conflict()
    const removing = direction === 'redo' && removedIds.has(change.id)
    if (removing) {
      // Older descriptors lack the action snapshot needed to safely hide content.
      if (change.removalAction === undefined)
        throw new Error('HISTORY_UNAVAILABLE')
      if (
        !isDeepStrictEqual(
          state.originalActions.get(change.id) ?? null,
          change.removalAction
        )
      )
        conflict()
    }
    // Hiding a subtree must not discard newer human fields, actions or children.
    const checkedFields =
      change.created || removing ? blockFields : change.fields
    if (checkedFields.some((field) => !equalField(row, expected, field)))
      conflict()
    if (change.created || removedIds.has(change.id)) {
      const ownedIds = change.created ? createdIds : removedIds
      const descendants = [change.id],
        seen = new Set<string>()
      while (descendants.length) {
        const id = descendants.shift()!
        if (seen.has(id)) conflict()
        seen.add(id)
        for (const child of state.blocks.values())
          if (
            child.parentBlockId === id &&
            (live(child) || ownedIds.has(idOf(child)))
          ) {
            if (!ownedIds.has(idOf(child))) conflict()
            descendants.push(idOf(child))
          }
      }
    }
    for (const field of change.fields) setField(row, next, field)
  }
  for (const change of inverse.actions) {
    const current = state.actions.get(change.id) ?? null,
      expected = change[expectedSide],
      next = change[nextSide]
    if ((current === null) !== (expected === null)) conflict()
    if (current && expected) {
      // Removing a whole action must not erase later tracking metadata.
      const checked: readonly ActionField[] =
        next === null ? actionFields : change.fields
      if (
        checked.some(
          (field) => !isDeepStrictEqual(current[field], expected[field])
        )
      )
        conflict()
    }
    if (next === null) state.actions.delete(change.id)
    else if (current) {
      for (const field of change.fields) current[field] = serialize(next[field])
    } else state.actions.set(change.id, serialize(next))
  }
  for (const change of inverse.journey) {
    if (!isDeepStrictEqual(state.journey[change.field], change[expectedSide]))
      conflict()
    state.journey[change.field] = serialize(change[nextSide])
  }
  for (const change of inverse.blocks) {
    const row = state.blocks.get(change.id)!
    if (!live(row)) continue
    let current = row
    const visited = new Set<string>()
    if (
      current.typename === 'ImageBlock' &&
      current.parentBlockId === null &&
      [
        state.journey.logoImageBlockId,
        state.journey.primaryImageBlockId
      ].includes(current.id)
    )
      continue
    while (current.typename !== 'StepBlock') {
      const parent = parentOf(current)
      if (parent === null || visited.has(parent)) conflict()
      visited.add(parent)
      const owner = state.blocks.get(parent)
      if (!live(owner)) conflict()
      current = owner!
    }
    if (current.parentBlockId !== null) conflict()
    const cards = [...state.blocks.values()].filter(
      (child) =>
        live(child) &&
        child.parentBlockId === current.id &&
        child.typename === 'CardBlock'
    )
    if (cards.length !== 1) conflict()
    if (change.fields.includes('nextBlockId') && row.nextBlockId !== null) {
      const target = state.blocks.get(requiredString(row.nextBlockId))
      if (!live(target) || target.typename !== 'StepBlock') conflict()
    }
    if (change.fields.includes('slug') && typeof row.slug === 'string') {
      const collision = await tx.block.findFirst({
        where: { journeyId: journey.id, slug: row.slug, id: { not: change.id } }
      })
      if (collision) conflict()
    }
  }
  for (const change of inverse.actions) {
    const action = state.actions.get(change.id)
    if (!action || action.blockId === null) continue
    const target = state.blocks.get(requiredString(action.blockId))
    if (!live(target) || target.typename !== 'StepBlock') conflict()
    const owner = state.blocks.get(change.id)
    if (!live(owner)) conflict()
  }
  if (state.journey.menuStepBlockId !== null) {
    const menu = state.blocks.get(requiredString(state.journey.menuStepBlockId))
    if (
      inverse.journey.some((change) => change.field === 'menuStepBlockId') &&
      (!live(menu) || menu.typename !== 'StepBlock')
    )
      conflict()
  }
  const plan = finishStructure(state, new Date().toISOString())
  plan.changes = []
  plan.warnings.push(
    'Restored recorded content, order and routes only. Successful media assets and external effects are retained.'
  )
  return plan
}
