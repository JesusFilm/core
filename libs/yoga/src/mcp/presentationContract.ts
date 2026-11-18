import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

const id = z.string().min(1).max(200)
export const plainText = z
  .string()
  .max(262144)
  .refine(
    (value) => !/<\/?[a-z][^>]*>/i.test(value),
    'Supply plain text, without HTML markup'
  )
export const typographyVariant = z.enum([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'body1',
  'body2',
  'caption'
])
const align = z.enum(['left', 'center', 'right'])
const rgb = z.string().regex(/^#[0-9a-f]{6}$/i)
const buttonVariant = z.enum(['text', 'contained', 'outlined'])
const buttonSize = z.enum(['small', 'medium', 'large'])
const buttonColor = z.enum(['primary', 'secondary', 'error'])
const alignment = z.enum(['left', 'center', 'right', 'justify'])
export const iconName = z.enum([
  'PlayArrowRounded',
  'TranslateRounded',
  'CheckCircleRounded',
  'FormatQuoteRounded',
  'ArrowForwardRounded',
  'ArrowBackRounded',
  'ChatBubbleOutlineRounded',
  'MenuBookRounded',
  'ChevronRightRounded',
  'ChevronLeftRounded',
  'BeenhereRounded',
  'SendRounded',
  'SubscriptionsRounded',
  'ContactSupportRounded',
  'Launch',
  'MailOutline',
  'ArrowLeftContained2',
  'ArrowRightContained2',
  'MessageChat1',
  'Home4',
  'LinkAngled',
  'Volume5',
  'Note2',
  'UserProfile2',
  'UsersProfiles3',
  'Phone'
])
const iconColor = z.enum(['inherit', 'primary', 'secondary', 'error'])
export const iconValue = z
  .object({
    name: iconName.nullable(),
    color: iconColor.optional()
  })
  .strict()
const spacing = z.number().int().min(20).max(400).multipleOf(10)
function hasChange(value: Record<string, unknown>) {
  return Object.keys(value).some(
    (field) => !['type', 'blockId', 'slot'].includes(field)
  )
}
export const buttonCommand = z
  .object({
    type: z.literal('button_set'),
    blockId: id,
    label: plainText.optional(),
    variant: buttonVariant.optional(),
    size: buttonSize.optional(),
    color: buttonColor.optional(),
    alignment: alignment.optional()
  })
  .strict()
  .refine(hasChange)
export const buttonIconCommand = z
  .object({
    type: z.literal('button_icon_set'),
    blockId: id,
    slot: z.enum(['start', 'end']),
    name: iconName.nullable().optional(),
    color: iconColor.optional()
  })
  .strict()
  .refine(hasChange)
export const spacerCommand = z
  .object({
    type: z.literal('spacer_set'),
    blockId: id,
    spacing
  })
  .strict()
export const cardCommand = z
  .object({
    type: z.literal('card_set'),
    blockId: id,
    fullscreen: z.boolean().optional(),
    backgroundColor: z
      .string()
      .regex(/^#[0-9a-f]{6}([0-9a-f]{2})?$/i)
      .nullable()
      .optional(),
    backdropBlur: z.number().int().min(0).max(25).nullable().optional(),
    themeMode: z.enum(['light', 'dark']).nullable().optional()
  })
  .strict()
  .refine(hasChange)
export const cardChatCommand = z
  .object({
    type: z.literal('card_chat_set'),
    blockId: id,
    enabled: z.boolean(),
    collapse: z.boolean()
  })
  .strict()
export const blockAddCommand = z
  .object({
    type: z.literal('block_add'),
    key: z.string().regex(/^[a-z][a-z0-9_]{0,31}$/),
    cardId: id,
    placement: z.discriminatedUnion('position', [
      z.object({ position: z.literal('end') }).strict(),
      z.object({ position: z.literal('before'), blockId: id }).strict(),
      z.object({ position: z.literal('after'), blockId: id }).strict()
    ]),
    block: z.discriminatedUnion('kind', [
      z
        .object({
          kind: z.literal('typography'),
          content: plainText,
          variant: typographyVariant.optional(),
          align: align.optional(),
          color: rgb.optional()
        })
        .strict(),
      z
        .object({
          kind: z.literal('button'),
          label: plainText,
          variant: buttonVariant.optional(),
          size: buttonSize.optional(),
          color: buttonColor.optional(),
          alignment: alignment.optional(),
          startIcon: iconValue.optional(),
          endIcon: iconValue.optional()
        })
        .strict(),
      z
        .object({ kind: z.literal('spacer'), spacing: spacing.optional() })
        .strict()
    ])
  })
  .strict()
export const presentationCommand = z.discriminatedUnion('type', [
  buttonCommand,
  buttonIconCommand,
  spacerCommand,
  cardCommand,
  cardChatCommand,
  blockAddCommand
])
export type PresentationCommand = z.infer<typeof presentationCommand>

export const presentationFields = [
  'content',
  'variant',
  'align',
  'settings.color',
  'label',
  'size',
  'color',
  'settings.alignment',
  'name',
  'spacing',
  'fullscreen',
  'backgroundColor',
  'backdropBlur',
  'themeMode',
  'themeName',
  'showAssistant',
  'expandChatByDefault',
  'startIconId',
  'endIconId',
  'parentOrder'
] as const
export type PresentationField = (typeof presentationFields)[number]
export const fieldChange = z
  .object({
    field: z.enum(presentationFields),
    before: z.json(),
    after: z.json(),
    beforePresent: z.boolean()
  })
  .strict()
export const contentParent = z.object({ cardId: id, stepId: id }).strict()
export const presentationInverse = z
  .object({
    type: z.literal('presentation_restore'),
    blockId: id,
    typename: z.string(),
    parent: contentParent,
    owner: z
      .object({ blockId: id, slot: z.enum(['startIconId', 'endIconId']) })
      .strict()
      .optional(),
    gate: z.literal('aiChatEditor').optional(),
    fields: z.array(fieldChange).min(1).max(20)
  })
  .strict()
  .refine(
    (inverse) =>
      inverse.fields.every(({ field, before, after }) => {
        const allowed: Record<string, readonly string[]> = {
          TypographyBlock: ['content', 'variant', 'align', 'settings.color'],
          ButtonBlock: [
            'label',
            'variant',
            'size',
            'color',
            'settings.alignment',
            'startIconId',
            'endIconId'
          ],
          IconBlock: ['name', 'color'],
          SpacerBlock: ['spacing'],
          CardBlock: [
            'fullscreen',
            'backgroundColor',
            'backdropBlur',
            'themeMode',
            'themeName',
            'showAssistant',
            'expandChatByDefault'
          ]
        }
        if (
          field !== 'parentOrder' &&
          !allowed[inverse.typename]?.includes(field)
        )
          return false
        if (
          inverse.typename === 'IconBlock' &&
          field !== 'parentOrder' &&
          !inverse.owner
        )
          return false
        if (
          ['showAssistant', 'expandChatByDefault'].includes(field) &&
          inverse.gate !== 'aiChatEditor'
        )
          return false
        // Undo may restore legacy JSON; redo must use a valid forward value.
        if (field === 'settings.alignment')
          return alignment.safeParse(after).success
        if (field === 'settings.color') return rgb.safeParse(after).success
        const expectedType = [
          'parentOrder',
          'spacing',
          'backdropBlur'
        ].includes(field)
          ? 'number'
          : ['fullscreen', 'showAssistant', 'expandChatByDefault'].includes(
                field
              )
            ? 'boolean'
            : 'string'
        return [before, after].every(
          (value) => value === null || typeof value === expectedType
        )
      }),
    'Inverse fields must belong to their recorded block type and feature gate'
  )
export const createdInverse = z
  .object({
    type: z.literal('content_created'),
    parent: contentParent,
    blocks: z
      .array(z.object({ id, state: z.record(z.string(), z.json()) }).strict())
      .min(1)
      .max(3)
  })
  .strict()
export type PresentationInverse = z.infer<typeof presentationInverse>
export type CreatedInverse = z.infer<typeof createdInverse>

/** Closed mounted field mapping. Unknown and legacy settings are never rebuilt. */
export function presentationPatch(
  state: Record<string, unknown>,
  command: Exclude<PresentationCommand, { type: 'block_add' }>
) {
  const values: Partial<Record<PresentationField, unknown>> = {}
  if (command.type === 'card_chat_set') {
    values.showAssistant = command.enabled
    values.expandChatByDefault = !command.collapse
  } else {
    for (const [field, value] of Object.entries(command)) {
      if (['type', 'blockId', 'slot'].includes(field) || value === undefined)
        continue
      values[
        field === 'alignment'
          ? 'settings.alignment'
          : (field as PresentationField)
      ] = value
    }
    if (command.type === 'card_set' && command.themeMode !== undefined)
      values.themeName = command.themeMode === null ? null : 'base'
  }
  const patch: Record<string, unknown> = {}
  const fields: z.infer<typeof fieldChange>[] = []
  for (const [rawField, after] of Object.entries(values)) {
    const field = rawField as PresentationField
    const setting = field.startsWith('settings.') ? field.slice(9) : undefined
    const source = setting ? settingsObject(state.settings) : state
    const key = setting ?? field
    const beforePresent = Object.prototype.hasOwnProperty.call(source, key)
    const before = source[key] ?? null
    if (beforePresent && isDeepStrictEqual(before, after)) continue
    if (setting)
      patch.settings = {
        ...settingsObject(patch.settings ?? state.settings),
        [setting]: after
      }
    else patch[field] = after
    fields.push(fieldChange.parse({ field, before, after, beforePresent }))
  }
  return { patch, fields }
}
export function settingsObject(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return {}
  if (typeof value !== 'object' || Array.isArray(value))
    throw new Error('VALIDATION_FAILED')
  return value as Record<string, unknown>
}

/** Submit is derived during complete creation; content copies become ordinary. */
export function deriveSubmitRole(
  operation: 'create' | 'duplicate-content' | 'duplicate-step',
  siblings: Array<{ typename: string; submitEnabled?: boolean | null }>,
  original = false
): boolean {
  if (operation === 'duplicate-content') return false
  if (operation === 'duplicate-step') return original
  return (
    siblings.some((block) =>
      ['TextResponseBlock', 'MultiselectBlock'].includes(block.typename)
    ) &&
    !siblings.some(
      (block) =>
        block.typename === 'ButtonBlock' && block.submitEnabled === true
    )
  )
}

function row<T extends z.ZodType>(
  schema: T,
  typename: string,
  writeSet: readonly string[]
) {
  return {
    schema,
    typename,
    writeSet,
    requiredRole: 'journey:update',
    requiredGrant: 'journeys:edit',
    sourceChecks: ['ordinary-draft', 'actual-parent-chain', 'owned-children'],
    effects: ['journey_content_changed'],
    apply: presentationPatch
  }
}
export const presentationRegistry = {
  button_set: row(buttonCommand, 'ButtonBlock', [
    'label',
    'variant',
    'size',
    'color',
    'settings.alignment'
  ]),
  button_icon_set: row(buttonIconCommand, 'ButtonBlock', [
    'name',
    'color',
    'startIconId',
    'endIconId'
  ]),
  spacer_set: row(spacerCommand, 'SpacerBlock', ['spacing']),
  card_set: row(cardCommand, 'CardBlock', [
    'fullscreen',
    'backgroundColor',
    'backdropBlur',
    'themeMode',
    'themeName'
  ]),
  card_chat_set: row(cardChatCommand, 'CardBlock', [
    'showAssistant',
    'expandChatByDefault'
  ]),
  block_add: row(blockAddCommand, 'CardBlock', [
    'owned-content',
    'owned-icons',
    'parentOrder'
  ])
} as const
