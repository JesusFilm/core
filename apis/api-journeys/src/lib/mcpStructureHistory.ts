import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { Prisma } from '@core/prisma/journeys/client'
import { deriveSubmitRole } from '@core/yoga/mcp/presentationContract'

import { type ContentBlock, assertOwnedButtonIcon } from './mcpContent'
import {
  type DestinationAccess,
  validateFormDestinations
} from './mcpFormDestinations'
import { validateFormIcons, validateForms } from './mcpForms'
import {
  type ActionField,
  type BlockChangeField,
  type BlockField,
  type BlockState,
  type Scalar,
  actionFields,
  actionState,
  blockFields,
  blockState,
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
  if (!field.startsWith('settings.'))
    return isDeepStrictEqual(
      current[field as BlockField],
      expected[field as BlockField]
    )
  const key = field.slice(9)
  const a = settings(current),
    b = settings(expected)
  return (
    Object.prototype.hasOwnProperty.call(a, key) ===
      Object.prototype.hasOwnProperty.call(b, key) &&
    isDeepStrictEqual(a[key], b[key])
  )
}
function setField(
  current: BlockState,
  value: BlockState,
  field: BlockChangeField
): void {
  if (!field.startsWith('settings.')) {
    current[field as BlockField] = serialize(value[field as BlockField])
    return
  }
  const next = { ...settings(current) },
    source = settings(value)
  const key = field.slice(9)
  if (Object.prototype.hasOwnProperty.call(source, key)) next[key] = source[key]
  else delete next[key]
  current.settings = next
}

/** Restores only recorded owned changes. Soft-deleted rows are deliberately
 * read here to restore the same IDs; they are never exposed as live content. */
export async function planStructureHistory(
  tx: Prisma.TransactionClient,
  journey: {
    id: string
    teamId?: string | null
    website: boolean | null
    menuStepBlockId: string | null
    socialNodeX: number | null
    socialNodeY: number | null
  },
  changes: unknown,
  direction: 'undo' | 'redo',
  canEditChat: () => Promise<boolean> = async () => false,
  destinationAccess?: DestinationAccess
) {
  const parsed = z.array(structureInverseSchema).length(1).safeParse(changes)
  if (!parsed.success) throw new Error('HISTORY_UNAVAILABLE')
  const inverse = parsed.data[0],
    state = await loadStructure(tx, journey, true)
  const requiresChat = inverse.blocks.some(
    (change) =>
      change.presentation?.gate === 'aiChatEditor' ||
      change.fields.some(
        (field) => field === 'showAssistant' || field === 'expandChatByDefault'
      )
  )
  if (requiresChat && !(await canEditChat()))
    throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
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
  const projected = state.blocks as unknown as Map<string, ContentBlock>
  for (const change of inverse.blocks) {
    const row = state.blocks.get(change.id)!
    if (!live(row)) continue
    if (
      row.typename === 'CardBlock' &&
      row.fullscreen === true &&
      change.presentation?.fields.includes('fullscreen') &&
      [...state.blocks.values()].some(
        (child) =>
          live(child) &&
          child.parentBlockId === row.id &&
          child.typename === 'VideoBlock'
      )
    )
      conflict()
    if (
      row.typename === 'ButtonBlock' &&
      row.submitEnabled === true &&
      change.created &&
      direction === 'redo'
    ) {
      const siblings = [...state.blocks.values()].filter(
        (sibling) =>
          live(sibling) &&
          sibling.id !== row.id &&
          sibling.parentBlockId === row.parentBlockId
      )
      if (
        !deriveSubmitRole(
          'create',
          siblings.map((sibling) => ({
            typename: requiredString(sibling.typename),
            submitEnabled: sibling.submitEnabled === true
          }))
        )
      )
        conflict()
    }
    const owner = change.presentation?.owner
    if (owner) {
      const button = state.blocks.get(owner.blockId)
      if (!live(button) || button[owner.slot] !== row.id) conflict()
      await assertOwnedButtonIcon(
        tx,
        button as unknown as ContentBlock,
        row as unknown as ContentBlock,
        projected
      )
    }
    if (row.typename === 'ButtonBlock')
      for (const slot of ['startIconId', 'endIconId'] as const) {
        if (!change.created && !change.fields.includes(slot)) continue
        if (row[slot] === null) continue
        const icon = state.blocks.get(requiredString(row[slot]))
        if (
          !live(icon) ||
          icon.journeyId !== journey.id ||
          [row.startIconId, row.endIconId, row.submitIconId].filter(
            (id) => id === icon.id
          ).length !== 1
        )
          throw new Error('HISTORY_UNAVAILABLE')
        try {
          await assertOwnedButtonIcon(
            tx,
            row as unknown as ContentBlock,
            icon as unknown as ContentBlock,
            projected
          )
        } catch (error) {
          if (error instanceof Error && error.message === 'HISTORY_CONFLICT')
            throw new Error('HISTORY_UNAVAILABLE', { cause: error })
          throw error
        }
      }
  }
  if (direction === 'undo' && createdIds.size) {
    const ids = [...createdIds]
    const referenceFields = [
      'parentBlockId',
      'startIconId',
      'endIconId',
      'submitIconId',
      'nextBlockId',
      'coverBlockId',
      'posterBlockId',
      'pollOptionImageBlockId'
    ] as const
    const references = await tx.block.findMany({
      where: {
        deletedAt: null,
        OR: referenceFields.map((field) => ({ [field]: { in: ids } }))
      }
    })
    // Own references can be removed by this same undo. Inspect the completed
    // projection before hiding a newly created object used by later work.
    const outsideReferences = references
      .filter((reference) => !state.originalBlocks.has(reference.id))
      .map(blockState)
    for (const row of [...state.blocks.values(), ...outsideReferences]) {
      if (!live(row) || createdIds.has(idOf(row))) continue
      if (
        referenceFields.some(
          (field) =>
            typeof row[field] === 'string' && createdIds.has(row[field])
        )
      )
        conflict()
    }
    const actions = await tx.action.findMany({
      where: {
        OR: [{ parentBlockId: { in: ids } }, { blockId: { in: ids } }]
      }
    })
    const outsideActions = actions
      .filter(
        (reference) => !state.originalActions.has(reference.parentBlockId)
      )
      .map(actionState)
    for (const action of [...state.actions.values(), ...outsideActions]) {
      if (
        [action.parentBlockId, action.blockId].some(
          (id) => typeof id === 'string' && createdIds.has(id)
        )
      )
        conflict()
    }
    const { menuStepBlockId, logoImageBlockId, primaryImageBlockId } =
      state.journey
    if (
      [menuStepBlockId, logoImageBlockId, primaryImageBlockId].some(
        (id) => typeof id === 'string' && createdIds.has(id)
      )
    )
      conflict()
  }
  const legacyBounds = new Set(
    inverse.blocks
      .filter(
        (change) =>
          direction === 'undo' &&
          change.typename === 'MultiselectBlock' &&
          change.formBounds?.beforeValid === false &&
          [...state.blocks.values()].filter(
            (option) =>
              live(option) &&
              option.parentBlockId === change.id &&
              option.typename === 'MultiselectOptionBlock'
          ).length === change.formBounds.beforeCount &&
          change.fields.some((field) => field === 'min' || field === 'max') &&
          isDeepStrictEqual(
            state.blocks.get(change.id)?.min,
            change.before.min
          ) &&
          isDeepStrictEqual(state.blocks.get(change.id)?.max, change.before.max)
      )
      .map((change) => change.id)
  )
  try {
    validateForms(
      state,
      new Set(inverse.blocks.map((change) => change.id)),
      legacyBounds
    )
  } catch {
    conflict()
  }
  await validateFormIcons(tx, state)
  await validateFormDestinations(tx, journey, state, destinationAccess)
  const plan = finishStructure(state, new Date().toISOString())
  plan.requiresChat = requiresChat
  plan.changes = []
  plan.warnings.push(
    'Restored recorded content, order and routes only. Successful media assets and external effects are retained.'
  )
  return plan
}
