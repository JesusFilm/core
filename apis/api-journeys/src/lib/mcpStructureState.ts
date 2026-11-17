import { randomUUID } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { Prisma } from '@core/prisma/journeys/client'
import type { OperationReceipt } from '@core/yoga/mcp/editContract'

// These are owning-service scalar descriptors, never client-controlled patches.
// Retaining every scalar makes complete subtree copies preserve unmounted data.
export const blockFields = [
  'id',
  'typename',
  'journeyId',
  'parentBlockId',
  'parentOrder',
  'label',
  'placeholder',
  'required',
  'variant',
  'color',
  'size',
  'startIconId',
  'endIconId',
  'eventLabel',
  'endEventLabel',
  'backgroundColor',
  'backdropBlur',
  'coverBlockId',
  'fullscreen',
  'themeMode',
  'themeName',
  'spacing',
  'gap',
  'direction',
  'justifyContent',
  'alignItems',
  'xl',
  'lg',
  'sm',
  'name',
  'src',
  'width',
  'height',
  'alt',
  'blurhash',
  'submitIconId',
  'submitLabel',
  'submitEnabled',
  'nextBlockId',
  'locked',
  'hint',
  'hideLabel',
  'minRows',
  'content',
  'align',
  'startAt',
  'endAt',
  'muted',
  'autoplay',
  'posterBlockId',
  'pollOptionImageBlockId',
  'fullsize',
  'videoId',
  'videoVariantLanguageId',
  'source',
  'title',
  'description',
  'image',
  'duration',
  'objectFit',
  'subtitleLanguageId',
  'showGeneratedSubtitles',
  'triggerStart',
  'x',
  'y',
  'routeId',
  'integrationId',
  'type',
  'deletedAt',
  'focalTop',
  'focalLeft',
  'gridView',
  'scale',
  'slug',
  'min',
  'max',
  'settings',
  'exportOrder',
  'customizable',
  'notes',
  'showAssistant',
  'expandChatByDefault'
] as const
export const actionFields = [
  'parentBlockId',
  'gtmEventName',
  'blockId',
  'journeyId',
  'url',
  'target',
  'email',
  'phone',
  'countryCode',
  'contactAction',
  'customizable',
  'parentStepId',
  'chatUrl'
] as const
export const journeyFields = [
  'menuStepBlockId',
  'socialNodeX',
  'socialNodeY'
] as const
export type BlockField = (typeof blockFields)[number]
export type BlockChangeField = BlockField | 'settings.color'
export type ActionField = (typeof actionFields)[number]
export type JourneyField = (typeof journeyFields)[number]
export type Scalar = z.infer<ReturnType<typeof z.json>>
export type BlockState = Record<BlockField, Scalar>
export type ActionState = Record<ActionField, Scalar>
export type JourneyState = { id: string } & Record<JourneyField, Scalar>
export type BlockRow = Prisma.BlockGetPayload<Record<string, never>>
export type ActionRow = Prisma.ActionGetPayload<Record<string, never>>

const scalar = z.json()
const blockStateSchema = z.record(z.enum(blockFields), scalar)
const actionStateSchema = z.record(z.enum(actionFields), scalar)
const blockChangeSchema = z
  .object({
    id: z.string(),
    typename: z.string(),
    parentBlockId: z.string().nullable(),
    created: z.boolean(),
    fields: z
      .array(z.enum([...blockFields, 'settings.color']))
      .max(blockFields.length),
    before: blockStateSchema,
    after: blockStateSchema
  })
  .strict()
const actionChangeSchema = z
  .object({
    id: z.string(),
    fields: z.array(z.enum(actionFields)).max(actionFields.length),
    before: actionStateSchema.nullable(),
    after: actionStateSchema.nullable()
  })
  .strict()
export const structureInverseSchema = z
  .object({
    type: z.literal('structure_restore'),
    owners: z
      .array(
        z
          .object({
            id: z.string(),
            typename: z.string(),
            parentBlockId: z.string().nullable()
          })
          .strict()
      )
      .max(1000),
    blocks: z.array(blockChangeSchema).max(200),
    actions: z.array(actionChangeSchema).max(200),
    journey: z
      .array(
        z
          .object({
            field: z.enum(journeyFields),
            before: scalar,
            after: scalar
          })
          .strict()
      )
      .max(3),
    siblings: z
      .array(
        z
          .object({
            parentBlockId: z.string().nullable(),
            before: z.array(z.string()).max(10000),
            after: z.array(z.string()).max(10000)
          })
          .strict()
      )
      .max(200)
  })
  .strict()
export type StructureInverse = z.infer<typeof structureInverseSchema>
export interface StructurePlan {
  journeyId: string
  changes: StructureInverse[]
  blockWrites: Array<{
    id: string
    create?: BlockState
    patch: Partial<BlockState>
  }>
  actionWrites: Array<{
    id: string
    value: ActionState | null
    fields: ActionField[]
  }>
  journeyPatch: Partial<Record<JourneyField, Scalar>>
  idMap: Record<string, string>
  duplicateIdMap: Record<string, string>
  duplicateMaps: NonNullable<OperationReceipt['duplicateMaps']>
  affectedLinks: NonNullable<OperationReceipt['affectedLinks']>
  changedFields: OperationReceipt['changedFields']
  warnings: string[]
  objectCount: number
}
export interface StructureState {
  journey: JourneyState
  originalJourney: JourneyState
  blocks: Map<string, BlockState>
  originalBlocks: Map<string, BlockState>
  actions: Map<string, ActionState>
  originalActions: Map<string, ActionState>
  created: Set<string>
  siblingParents: Set<string | null>
}

export function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
export function blockState(row: BlockRow): BlockState {
  return Object.fromEntries(
    blockFields.map((field) => [
      field,
      row[field] instanceof Date ? row[field].toISOString() : row[field]
    ])
  ) as BlockState
}
export function actionState(row: ActionRow): ActionState {
  return Object.fromEntries(
    actionFields.map((field) => [field, row[field]])
  ) as ActionState
}
export function emptyBlock(
  journeyId: string,
  typename: string,
  id: string = randomUUID()
): BlockState {
  return {
    ...Object.fromEntries(blockFields.map((field) => [field, null])),
    id,
    typename,
    journeyId,
    settings: {},
    required: false,
    submitEnabled: true,
    hideLabel: false,
    focalLeft: 50,
    focalTop: 50
  } as BlockState
}
export function emptyAction(id: string): ActionState {
  return {
    ...Object.fromEntries(actionFields.map((field) => [field, null])),
    parentBlockId: id,
    contactAction: 'call'
  } as ActionState
}
export function live(row: BlockState | undefined): row is BlockState {
  return Boolean(row && row.deletedAt === null)
}
export function idOf(row: BlockState): string {
  return requiredString(row.id)
}
export function requiredString(value: Scalar): string {
  if (typeof value !== 'string') throw new Error('VALIDATION_FAILED')
  return value
}
export function parentOf(row: BlockState): string | null {
  return typeof row.parentBlockId === 'string' ? row.parentBlockId : null
}
export function children(
  state: StructureState,
  parentId: string
): BlockState[] {
  return [...state.blocks.values()]
    .filter((row) => live(row) && row.parentBlockId === parentId)
    .sort(compareOrder)
}
export function compareOrder(a: BlockState, b: BlockState): number {
  const order = Number(a.parentOrder ?? -1) - Number(b.parentOrder ?? -1)
  return order || requiredString(a.id).localeCompare(requiredString(b.id))
}
export function siblingsFrom(
  blocks: Map<string, BlockState>,
  parentId: string | null
): string[] {
  return [...blocks.values()]
    .filter(
      (row) =>
        live(row) &&
        row.parentOrder !== null &&
        (parentId === null
          ? row.typename === 'StepBlock' && row.parentBlockId === null
          : row.parentBlockId === parentId)
    )
    .sort(compareOrder)
    .map(idOf)
}
export async function loadStructure(
  tx: Prisma.TransactionClient,
  journey: {
    id: string
    menuStepBlockId: string | null
    socialNodeX: number | null
    socialNodeY: number | null
  },
  includeDeleted = false
): Promise<StructureState> {
  const rows = await tx.block.findMany({
    where: {
      journeyId: journey.id,
      ...(includeDeleted ? {} : { deletedAt: null })
    },
    include: { action: true },
    take: 100001
  })
  if (rows.length > 100000) throw new Error('LIMIT_EXCEEDED')
  const blocks = new Map(rows.map((row) => [row.id, blockState(row)]))
  const actions = new Map(
    rows
      .filter((row) => row.action !== null)
      .map((row) => [row.id, actionState(row.action!)])
  )
  const journeyState: JourneyState = {
    id: journey.id,
    menuStepBlockId: journey.menuStepBlockId,
    socialNodeX: journey.socialNodeX,
    socialNodeY: journey.socialNodeY
  }
  return {
    journey: { ...journeyState },
    originalJourney: journeyState,
    blocks: new Map([...blocks].map(([id, row]) => [id, serialize(row)])),
    originalBlocks: blocks,
    actions: new Map([...actions].map(([id, row]) => [id, serialize(row)])),
    originalActions: actions,
    created: new Set(),
    siblingParents: new Set()
  }
}
export function finishStructure(
  state: StructureState,
  now: string
): StructurePlan {
  const inverse: StructureInverse = {
    type: 'structure_restore',
    owners: [],
    blocks: [],
    actions: [],
    journey: [],
    siblings: []
  }
  const plan: StructurePlan = {
    journeyId: state.journey.id,
    changes: [],
    blockWrites: [],
    actionWrites: [],
    journeyPatch: {},
    idMap: {},
    duplicateIdMap: {},
    duplicateMaps: {},
    affectedLinks: [],
    changedFields: [],
    warnings: [],
    objectCount: 0
  }
  for (const [id, row] of state.blocks) {
    const original = state.originalBlocks.get(id)
    const created = state.created.has(id)
    const before = original ?? { ...serialize(row), deletedAt: now }
    const fields: BlockChangeField[] = blockFields.filter(
      (field) => !isDeepStrictEqual(before[field], row[field])
    )
    if (!created && fields.includes('settings')) {
      fields.splice(fields.indexOf('settings'), 1, 'settings.color')
    }
    if (!created && !fields.length) continue
    inverse.blocks.push({
      id,
      typename: requiredString(row.typename),
      parentBlockId: parentOf(row),
      created,
      fields: [...fields],
      before: serialize(before),
      after: serialize(row)
    })
    plan.blockWrites.push({
      id,
      ...(created ? { create: serialize(row) } : {}),
      patch: Object.fromEntries(
        fields.map((field) =>
          field === 'settings.color'
            ? ['settings', row.settings]
            : [field, row[field]]
        )
      )
    })
    const summary = fields.filter(
      (field) => !['id', 'journeyId', 'typename', 'settings'].includes(field)
    )
    plan.changedFields.push({
      blockId: id,
      fields: created
        ? ['created']
        : (summary as OperationReceipt['changedFields'][number]['fields'])
    })
  }
  for (const id of new Set([
    ...state.originalActions.keys(),
    ...state.actions.keys()
  ])) {
    const before = state.originalActions.get(id) ?? null,
      after = state.actions.get(id) ?? null
    if (isDeepStrictEqual(before, after)) continue
    const fields = actionFields.filter(
      (field) => !isDeepStrictEqual(before?.[field], after?.[field])
    )
    inverse.actions.push({
      id,
      fields: [...fields],
      before: serialize(before),
      after: serialize(after)
    })
    plan.actionWrites.push({ id, value: serialize(after), fields: [...fields] })
    plan.changedFields.push({ blockId: id, fields: ['action'] })
  }
  for (const field of journeyFields) {
    const before = state.originalJourney[field],
      after = state.journey[field]
    if (isDeepStrictEqual(before, after)) continue
    inverse.journey.push({ field, before, after })
    plan.journeyPatch[field] = after
    plan.changedFields.push({ blockId: state.journey.id, fields: [field] })
  }
  for (const parentBlockId of state.siblingParents) {
    const before = siblingsFrom(state.originalBlocks, parentBlockId),
      after = siblingsFrom(state.blocks, parentBlockId)
    if (!isDeepStrictEqual(before, after))
      inverse.siblings.push({ parentBlockId, before, after })
  }
  const summaryById = new Map<
    string,
    Set<OperationReceipt['changedFields'][number]['fields'][number]>
  >()
  for (const summary of plan.changedFields) {
    const fields = summaryById.get(summary.blockId) ?? new Set()
    summary.fields.forEach((field) => fields.add(field))
    summaryById.set(summary.blockId, fields)
  }
  plan.changedFields = [...summaryById].map(([blockId, fields]) => ({
    blockId,
    fields: [...fields]
  }))
  plan.objectCount = new Set([
    ...inverse.blocks.map((row) => row.id),
    ...inverse.actions.map((row) => row.id),
    ...(inverse.journey.length ? [state.journey.id] : [])
  ]).size
  if (plan.objectCount > 200) throw new Error('LIMIT_EXCEEDED')
  const removedSteps = new Set(
    [...state.originalBlocks]
      .filter(
        ([id, before]) =>
          before.typename === 'StepBlock' &&
          live(before) &&
          !live(state.blocks.get(id))
      )
      .map(([id]) => id)
  )
  for (const [id, row] of state.blocks) {
    if (!live(row)) continue
    if (
      row.typename === 'StepBlock' &&
      typeof row.nextBlockId === 'string' &&
      removedSteps.has(row.nextBlockId)
    )
      plan.affectedLinks.push({
        sourceBlockId: id,
        kind: 'default',
        destinationStepId: row.nextBlockId
      })
    const destination = state.actions.get(id)?.blockId
    if (typeof destination === 'string' && removedSteps.has(destination))
      plan.affectedLinks.push({
        sourceBlockId: id,
        kind: 'action',
        destinationStepId: destination
      })
  }
  if (plan.affectedLinks.length)
    plan.warnings.push(
      'Incoming routes still reference removed Steps. Repairs require an explicit requested or accepted route edit.'
    )
  const ownerIds = new Set([
    ...inverse.blocks.map((change) => change.id),
    ...inverse.actions.map((change) => change.id)
  ])
  const recordedOwners = new Set<string>()
  for (const id of ownerIds) {
    let current = state.blocks.get(id)
    const seen = new Set<string>()
    while (current) {
      const currentId = idOf(current)
      if (seen.has(currentId)) throw new Error('VALIDATION_FAILED')
      seen.add(currentId)
      if (!recordedOwners.has(currentId)) {
        inverse.owners.push({
          id: currentId,
          typename: requiredString(current.typename),
          parentBlockId: parentOf(current)
        })
        recordedOwners.add(currentId)
      }
      const parent = parentOf(current)
      current = parent === null ? undefined : state.blocks.get(parent)
    }
  }
  if (
    inverse.blocks.length ||
    inverse.actions.length ||
    inverse.journey.length
  ) {
    const parsed = structureInverseSchema.safeParse(inverse)
    if (!parsed.success) throw new Error('LIMIT_EXCEEDED')
    plan.changes.push(parsed.data)
  }
  return plan
}
function blockInput(
  row: Partial<BlockState>
): Prisma.BlockUncheckedUpdateInput {
  const input = { ...row }
  delete input.id
  delete input.journeyId
  delete input.typename
  if (input.settings === null) input.settings = {}
  return input as Prisma.BlockUncheckedUpdateInput
}

/** The caller accepts once after planning and executes inside its owning transaction. */
export async function executeStructure(
  tx: Prisma.TransactionClient,
  plan: StructurePlan
): Promise<void> {
  // Create shells first because cover/poster/icon references can point forward.
  for (const write of plan.blockWrites) {
    if (!write.create) continue
    await tx.block.create({
      data: {
        id: write.id,
        journeyId: requiredString(write.create.journeyId),
        typename: requiredString(write.create.typename),
        parentBlockId: null
      }
    })
  }
  for (const write of plan.blockWrites) {
    await tx.block.update({
      where: { id: write.id },
      data: blockInput(write.create ?? write.patch)
    })
  }
  for (const write of plan.actionWrites) {
    if (write.value === null) {
      await tx.action.deleteMany({ where: { parentBlockId: write.id } })
      continue
    }
    const full = write.value as Prisma.ActionUncheckedCreateInput
    const patch = Object.fromEntries(
      write.fields
        .filter((field) => field !== 'parentBlockId')
        .map((field) => [field, write.value![field]])
    ) as Prisma.ActionUncheckedUpdateInput
    await tx.action.upsert({
      where: { parentBlockId: write.id },
      create: full,
      update: patch
    })
  }
  if (Object.keys(plan.journeyPatch).length)
    await tx.journey.update({
      where: { id: plan.journeyId },
      data: plan.journeyPatch as Prisma.JourneyUncheckedUpdateInput
    })
}
