import { createHash } from 'node:crypto'

import { z } from 'zod'

import { formChangedFields, formCommand } from './formContract'
import {
  plainText,
  presentationCommand,
  presentationFields,
  presentationRegistry
} from './presentationContract'
import {
  type StructureCommand,
  affectedLink,
  changedField,
  generatedLocalKey,
  localKey,
  structureCommand,
  structureCommandNames
} from './structureContract'

const id = z.string().min(1).max(200)
export const revisionInput = z
  .string()
  .regex(/^(0|[1-9]\d{0,19})$/)
  .refine((value) => BigInt(value) <= 18446744073709551615n)
export const idempotencyKeyInput = z.string().min(16).max(128)
export const typographyCommand = z
  .object({
    type: z.literal('typography_set'),
    blockId: id,
    content: plainText.optional(),
    variant: z
      .enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2', 'caption'])
      .optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    color: z
      .string()
      .regex(/^#[0-9a-f]{6}$/i)
      .optional()
  })
  .strict()
  .refine(
    (command) =>
      ['content', 'variant', 'align', 'color'].some((field) =>
        Object.prototype.hasOwnProperty.call(command, field)
      ),
    'At least one supported field must be supplied'
  )
const editCommand = z.union([
  typographyCommand,
  presentationCommand,
  formCommand,
  structureCommand
])

export function isStructureCommand(
  command: z.infer<typeof editCommand>
): command is StructureCommand {
  if (command.type === 'block_add') return 'card' in command
  return structureCommandNames.some((name) => name === command.type)
}

export const editInput = z
  .object({
    journeyId: id,
    expectedRevision: revisionInput,
    idempotencyKey: idempotencyKeyInput,
    commands: z.array(editCommand).min(1).max(50)
  })
  .strict()
  .superRefine((input, context) => {
    // Old content-only receipts can contain repeated assignments. The owner
    // checks their replay keys before validating new writes.
    if (!input.commands.some(isStructureCommand)) return
    const writes = new Map<string, Set<string>>()
    input.commands.forEach((command, index) => {
      if (command.type !== 'typography_set') return
      const fields = writes.get(command.blockId) ?? new Set<string>()
      for (const field of ['content', 'variant', 'align', 'color'] as const) {
        if (command[field] === undefined) continue
        if (fields.has(field))
          context.addIssue({
            code: 'custom',
            path: ['commands', index, field],
            message: 'A batch cannot write the same block field twice'
          })
        fields.add(field)
      }
      writes.set(command.blockId, fields)
    })
  })
export const historyInput = z.object({ journeyId: id }).strict()
export const historyActionInput = z
  .object({
    journeyId: id,
    expectedRevision: revisionInput,
    entryId: z.string().uuid(),
    idempotencyKey: idempotencyKeyInput
  })
  .strict()
export const historyResult = z
  .object({
    contractVersion: z.literal('1'),
    kind: z.literal('journey_history'),
    journeyId: id,
    revision: revisionInput,
    undoEntryId: z.string().uuid().nullable(),
    redoEntryId: z.string().uuid().nullable(),
    entries: z
      .array(
        z
          .object({
            entryId: z.string().uuid(),
            operationId: z.string().uuid(),
            label: z.enum([
              'Typography edit',
              'Content and presentation edit',
              'Structure edit'
            ]),
            state: z.enum(['undo', 'redo']),
            createdAt: z.string().datetime()
          })
          .strict()
      )
      .max(5)
  })
  .strict()
export const operationInput = z
  .object({
    journeyId: id,
    operationId: z.string().uuid().optional(),
    idempotencyKey: idempotencyKeyInput.optional()
  })
  .strict()
  .refine(
    (input) => Boolean(input.operationId) !== Boolean(input.idempotencyKey),
    'Supply exactly one operationId or idempotencyKey'
  )
export const operationReceipt = z
  .object({
    contractVersion: z.literal('1'),
    operationId: z.string().uuid(),
    journeyId: id,
    committedRevision: revisionInput,
    kind: z.literal('historical_receipt'),
    adminLink: z.string().url(),
    status: z.literal('committed'),
    completedAt: z.string().datetime(),
    historyId: z.string().uuid().nullable(),
    historyAction: z.enum(['undo', 'redo']).optional(),
    changedFields: z
      .array(
        z
          .object({
            blockId: id,
            fields: z
              .array(
                z.enum([
                  ...changedField.options,
                  ...presentationFields,
                  ...formChangedFields,
                  'deleted'
                ])
              )
              .max(32)
          })
          .strict()
      )
      .max(200),
    idMap: z.record(z.union([localKey, generatedLocalKey]), id),
    duplicateIdMap: z.record(id, id).optional(),
    duplicateMaps: z
      .record(
        localKey,
        z.array(z.object({ sourceId: id, blockId: id }).strict()).max(200)
      )
      .optional(),
    affectedLinks: z.array(affectedLink).optional(),
    effectIds: z.array(z.string().uuid()).max(200),
    warnings: z.array(z.string().max(4096)).max(100)
  })
  .strict()
export const privateOperationErrorCodes = [
  'LIMIT_EXCEEDED',
  'IDEMPOTENCY_KEY_REUSED',
  'RESULT_EXPIRED',
  'RESULT_UNAVAILABLE',
  'REVISION_CONFLICT',
  'NOT_EDITABLE',
  'HISTORY_CONFLICT',
  'HISTORY_UNAVAILABLE'
] as const
export const operationFailure = z
  .object({
    contractVersion: z.literal('1'),
    kind: z.literal('operation_failure'),
    code: z.enum(privateOperationErrorCodes)
  })
  .strict()
export const operationResult = z.discriminatedUnion('kind', [
  operationReceipt,
  operationFailure
])
export type OperationResult = z.infer<typeof operationResult>
export type OperationReceipt = z.infer<typeof operationReceipt>
export type EditInput = z.infer<typeof editInput>
export type OperationInput = z.infer<typeof operationInput>
export type TypographyCommand = z.infer<typeof typographyCommand>
export type HistoryResult = z.infer<typeof historyResult>

/** Arrays preserve command order. Object key order never changes request identity. */
export function canonicalFingerprint(value: unknown): string {
  const canonicalize = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(canonicalize)
    if (item && typeof item === 'object')
      return Object.fromEntries(
        Object.entries(item)
          .filter(([, entry]) => entry !== undefined)
          .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
          .map(([key, entry]) => [key, canonicalize(entry)])
      )
    return item
  }
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')
}

export interface TypographyState {
  content: string | null
  variant: string | null
  align: string | null
  settings: unknown
}
type TypographyField = 'content' | 'variant' | 'align' | 'settings.color'
export interface TypographyInverse {
  type: 'typography_restore'
  blockId: string
  parent?: { cardId: string; stepId: string }
  fields: Array<{
    field: TypographyField
    before: unknown
    after: unknown
    beforePresent: boolean
  }>
}
export interface TypographyPatch {
  content?: string
  variant?: string
  align?: string
  settings?: Record<string, unknown>
}

function applyTypography(
  state: TypographyState,
  command: TypographyCommand
): {
  patch: TypographyPatch
  inverse: TypographyInverse
  changedFields: TypographyField[]
} {
  typographyCommand.parse(command)
  const patch: TypographyPatch = {}
  const inverse: TypographyInverse = {
    type: 'typography_restore',
    blockId: command.blockId,
    fields: []
  }
  for (const field of ['content', 'variant', 'align'] as const) {
    const value = command[field]
    if (value === undefined || value === state[field]) continue
    patch[field] = value
    inverse.fields.push({
      field,
      before: state[field],
      after: value,
      beforePresent: true
    })
  }
  if (command.color !== undefined) {
    if (
      state.settings !== null &&
      state.settings !== undefined &&
      (typeof state.settings !== 'object' || Array.isArray(state.settings))
    )
      throw new Error('VALIDATION_FAILED')
    const settings =
      state.settings &&
      typeof state.settings === 'object' &&
      !Array.isArray(state.settings)
        ? (state.settings as Record<string, unknown>)
        : {}
    if (settings.color !== command.color) {
      patch.settings = { ...settings, color: command.color }
      inverse.fields.push({
        field: 'settings.color',
        before: settings.color ?? null,
        after: command.color,
        beforePresent: Object.prototype.hasOwnProperty.call(settings, 'color')
      })
    }
  }
  return {
    patch,
    inverse,
    changedFields: inverse.fields.map(({ field }) => field)
  }
}

/** Every enabled command owns validation, source checks, effects and inverses.
 * The owning executor performs these source checks under the journey lock.
 * Adding a command requires an executable row and its positive/negative fixtures.
 */
export const commandRegistry = {
  ...presentationRegistry,
  typography_set: {
    schema: typographyCommand,
    resultSchema: operationReceipt,
    requiredRole: 'journey:update',
    requiredGrant: 'journeys:edit',
    sourceChecks: [
      'ordinary-draft',
      'live-owned-typography',
      'owned-card-and-step'
    ],
    dependencies: ['journey-revision', 'actual-parent-chain'],
    writeSet: ['content', 'variant', 'align', 'settings.color'],
    preserved: ['legacy-subtype', 'legacy-color', 'unrelated-settings', 'Host'],
    effects: ['journey_content_changed'],
    inverseType: 'typography_restore',
    apply: applyTypography,
    fixtures: {
      accepted: {
        type: 'typography_set',
        blockId: 'heading',
        content: 'A new heading',
        variant: 'h1',
        align: 'center',
        color: '#123456'
      },
      rejected: {
        type: 'typography_set',
        blockId: 'heading',
        content: 'A new heading',
        hostId: 'excluded'
      }
    }
  }
} as const
