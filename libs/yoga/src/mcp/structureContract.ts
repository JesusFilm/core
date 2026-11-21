import { z } from 'zod'

const id = z.string().min(1).max(200)
export const localKey = z
  .string()
  .min(1)
  .max(32)
  .regex(/^(?!__proto__$)[a-z0-9_]+$/)
export const blockReference = z.union([
  z.object({ id }).strict(),
  z.object({ local: localKey }).strict()
])
export type BlockReference = z.infer<typeof blockReference>
export type Reference = BlockReference

export const placement = z.union([
  z.object({ position: z.literal('end') }).strict(),
  z
    .object({
      position: z.enum(['before', 'after']),
      anchor: blockReference
    })
    .strict()
])
export type Placement = z.infer<typeof placement>

// Positions are stored in Prisma Int columns. Do not accept nonfinite values
// or values the owning database cannot persist.
const coordinate = z.number().int().min(-2147483648).max(2147483647)
const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i)
const typographyVariant = z.enum([
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

export const contentCreate = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('typography'),
      content: z.string().max(262144).optional(),
      variant: typographyVariant.optional(),
      align: z.enum(['left', 'center', 'right']).optional(),
      color: hexColor.optional()
    })
    .strict(),
  z
    .object({
      kind: z.literal('button'),
      label: z.string().max(262144).optional(),
      variant: z.enum(['text', 'contained', 'outlined']).optional(),
      size: z.enum(['small', 'medium', 'large']).optional(),
      color: z.enum(['primary', 'secondary', 'error']).optional(),
      align: z.enum(['left', 'center', 'right', 'justify']).optional()
    })
    .strict(),
  z
    .object({
      kind: z.literal('spacer'),
      spacing: z.number().int().min(20).max(400).multipleOf(10).optional()
    })
    .strict(),
  z.object({ kind: z.literal('image') }).strict(),
  z.object({ kind: z.literal('video') }).strict()
])
export type ContentCreate = z.infer<typeof contentCreate>

export const cardAppearance = z
  .object({
    fullscreen: z.boolean().optional(),
    backgroundColor: z
      .string()
      .regex(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i)
      .nullable()
      .optional(),
    backdropBlur: z.number().int().min(0).max(25).nullable().optional(),
    themeMode: z.enum(['light', 'dark']).nullable().optional(),
    themeName: z.literal('base').nullable().optional()
  })
  .strict()

const navigationSchemes = new Set([
  'http:',
  'https:',
  'viber:',
  'whatsapp:',
  'tg:',
  'fb-messenger:',
  'line:',
  'skype:'
])

/** Match Admin's HTTPS default while restricting executable navigation schemes. */
export function normalizeActionUrl(value: string): string {
  if (
    value !== value.trim() ||
    [...value].some(
      (char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127
    )
  )
    throw new Error('VALIDATION_FAILED')
  const normalized = /^[a-z][a-z0-9+.-]*:/i.test(value)
    ? value
    : `https://${value}`
  let url: URL
  try {
    url = new URL(normalized)
  } catch {
    throw new Error('VALIDATION_FAILED')
  }
  if (!navigationSchemes.has(url.protocol) || url.username || url.password)
    throw new Error('VALIDATION_FAILED')
  if (['http:', 'https:'].includes(url.protocol) && !url.hostname)
    throw new Error('VALIDATION_FAILED')
  return normalized
}

const navigationUrl = z
  .string()
  .min(1)
  .max(4096)
  .refine((value) => {
    try {
      normalizeActionUrl(value)
      return true
    } catch {
      return false
    }
  }, 'Use HTTP, HTTPS or a supported messaging scheme')
const phoneFields = {
  phone: z
    .string()
    .min(1)
    .max(50)
    .regex(/^\+?[0-9][0-9 ().-]*$/),
  countryCode: z.string().regex(/^[A-Z]{2}$/)
}
export const actionValue = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('none') }).strict(),
  z.object({ kind: z.literal('step'), destination: blockReference }).strict(),
  z.object({ kind: z.literal('link'), url: navigationUrl }).strict(),
  z.object({ kind: z.literal('email'), email: z.email().max(320) }).strict(),
  z.object({ kind: z.literal('chat'), chatUrl: navigationUrl }).strict(),
  z.object({ kind: z.literal('phone'), ...phoneFields }).strict(),
  z.object({ kind: z.literal('sms'), ...phoneFields }).strict()
])
export type ActionValue = z.infer<typeof actionValue>

export const structureCommand = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('step_add'),
      key: localKey,
      cardKey: localKey,
      placement,
      x: coordinate.optional(),
      y: coordinate.optional(),
      card: cardAppearance.optional(),
      content: z
        .array(z.object({ key: localKey, content: contentCreate }).strict())
        .max(200)
        .optional()
    })
    .strict(),
  z
    .object({
      type: z.literal('block_add'),
      key: localKey,
      card: blockReference,
      placement,
      content: contentCreate
    })
    .strict(),
  z
    .object({
      type: z.literal('step_duplicate'),
      source: blockReference,
      key: localKey,
      placement
    })
    .strict(),
  z
    .object({
      type: z.literal('block_duplicate'),
      source: blockReference,
      key: localKey,
      placement
    })
    .strict(),
  z.object({ type: z.literal('step_remove'), step: blockReference }).strict(),
  z.object({ type: z.literal('block_remove'), block: blockReference }).strict(),
  z
    .object({
      type: z.literal('steps_reorder'),
      steps: z.array(blockReference).max(200)
    })
    .strict(),
  z
    .object({
      type: z.literal('content_reorder'),
      card: blockReference,
      blocks: z.array(blockReference).max(200)
    })
    .strict(),
  z
    .object({
      type: z.literal('step_default_set'),
      step: blockReference,
      destination: blockReference.nullable()
    })
    .strict(),
  z
    .object({
      type: z.literal('action_set'),
      block: blockReference,
      action: actionValue
    })
    .strict(),
  z
    .object({
      type: z.literal('step_position_set'),
      step: blockReference,
      x: coordinate,
      y: coordinate
    })
    .strict(),
  z
    .object({
      type: z.literal('social_position_set'),
      x: coordinate,
      y: coordinate
    })
    .strict(),
  z.object({ type: z.literal('graph_auto_arrange') }).strict(),
  z
    .object({
      type: z.literal('card_slug_set'),
      step: blockReference,
      slug: z.string().max(200).nullable()
    })
    .strict()
])
export type StructureCommand = z.infer<typeof structureCommand>

export const affectedLink = z
  .object({
    sourceBlockId: id,
    kind: z.enum(['default', 'action']),
    destinationStepId: id
  })
  .strict()
export type AffectedLink = z.infer<typeof affectedLink>

export const changedField = z.enum([
  'content',
  'variant',
  'align',
  'settings.color',
  'created',
  'parentOrder',
  'deletedAt',
  'nextBlockId',
  'action',
  'x',
  'y',
  'slug',
  'menuStepBlockId',
  'socialNodeX',
  'socialNodeY',
  'coverBlockId',
  'posterBlockId',
  'pollOptionImageBlockId',
  'startIconId',
  'endIconId',
  'submitIconId',
  'submitEnabled',
  'min',
  'max',
  'src',
  'width',
  'height',
  'blurhash',
  'alt',
  'scale',
  'focalLeft',
  'focalTop',
  'source',
  'videoId',
  'videoVariantLanguageId',
  'title',
  'description',
  'image',
  'duration',
  'startAt',
  'endAt',
  'objectFit',
  'muted',
  'autoplay',
  'subtitleLanguageId',
  'showGeneratedSubtitles',
  'logoImageBlockId',
  'primaryImageBlockId'
])
export type ChangedField = z.infer<typeof changedField>

const acceptedFixtures: Record<StructureCommand['type'], StructureCommand> = {
  step_add: {
    type: 'step_add',
    key: 'new_step',
    cardKey: 'new_card',
    placement: { position: 'end' },
    content: [
      { key: 'heading', content: { kind: 'typography', content: 'Heading' } }
    ]
  },
  block_add: {
    type: 'block_add',
    key: 'button',
    card: { id: 'card' },
    placement: { position: 'end' },
    content: { kind: 'button', label: 'Continue' }
  },
  step_duplicate: {
    type: 'step_duplicate',
    source: { id: 'step' },
    key: 'copy',
    placement: { position: 'end' }
  },
  block_duplicate: {
    type: 'block_duplicate',
    source: { id: 'button' },
    key: 'copy',
    placement: { position: 'end' }
  },
  step_remove: { type: 'step_remove', step: { id: 'step' } },
  block_remove: { type: 'block_remove', block: { id: 'button' } },
  steps_reorder: {
    type: 'steps_reorder',
    steps: [{ id: 'step_b' }, { id: 'step_a' }]
  },
  content_reorder: {
    type: 'content_reorder',
    card: { id: 'card' },
    blocks: [{ id: 'button' }, { id: 'heading' }]
  },
  step_default_set: {
    type: 'step_default_set',
    step: { id: 'step' },
    destination: { local: 'new_step' }
  },
  action_set: {
    type: 'action_set',
    block: { id: 'answer' },
    action: { kind: 'step', destination: { id: 'step' } }
  },
  step_position_set: {
    type: 'step_position_set',
    step: { id: 'step' },
    x: 100,
    y: -20
  },
  social_position_set: { type: 'social_position_set', x: 0, y: 0 },
  graph_auto_arrange: { type: 'graph_auto_arrange' },
  card_slug_set: {
    type: 'card_slug_set',
    step: { id: 'step' },
    slug: 'Next step'
  }
}

const sourceChecks: Record<StructureCommand['type'], readonly string[]> = {
  step_add: ['complete-step-card-descendants', 'same-parent-placement'],
  block_add: [
    'owned-live-card',
    'registered-create-defaults',
    'complete-icons'
  ],
  step_duplicate: [
    'owned-live-step',
    'complete-owned-subtree',
    'authorized-external-references'
  ],
  block_duplicate: [
    'owned-mounted-content',
    'standalone-video-unavailable',
    'complete-owned-subtree'
  ],
  step_remove: [
    'owned-live-step',
    'preserve-incoming-routes',
    'clear-owning-menu'
  ],
  block_remove: [
    'owned-mounted-content',
    'complete-owned-subtree',
    'dependent-owner-state'
  ],
  steps_reorder: ['complete-live-step-sibling-set'],
  content_reorder: [
    'owned-live-card',
    'complete-ordered-sibling-set',
    'exclude-media-slots'
  ],
  step_default_set: ['owned-live-source-step', 'live-same-journey-step-target'],
  action_set: [
    'eligible-live-owner',
    'derived-owner-step',
    'live-same-journey-step-target',
    'submit-action-restrictions'
  ],
  step_position_set: ['owned-live-step', 'persistable-coordinates'],
  social_position_set: ['persistable-coordinates'],
  graph_auto_arrange: ['server-owned-graph-layout', 'social-node-reset'],
  card_slug_set: ['owned-live-step', 'unique-normalized-slug']
}
const writeSets: Record<StructureCommand['type'], readonly ChangedField[]> = {
  step_add: ['created', 'parentOrder'],
  block_add: ['created', 'parentOrder', 'startIconId', 'endIconId'],
  step_duplicate: ['created', 'parentOrder'],
  block_duplicate: ['created', 'parentOrder', 'submitEnabled'],
  step_remove: ['deletedAt', 'parentOrder', 'menuStepBlockId'],
  block_remove: ['deletedAt', 'parentOrder', 'min', 'max'],
  steps_reorder: ['parentOrder'],
  content_reorder: ['parentOrder'],
  step_default_set: ['nextBlockId'],
  action_set: ['action'],
  step_position_set: ['x', 'y'],
  social_position_set: ['socialNodeX', 'socialNodeY'],
  graph_auto_arrange: ['x', 'y', 'socialNodeX', 'socialNodeY'],
  card_slug_set: ['slug']
}

export const structureCommandNames = Object.keys(
  acceptedFixtures
) as StructureCommand['type'][]

/** The owning structure executor implements these rows under the draft lock. */
export const structureCommandRegistry = Object.fromEntries(
  structureCommandNames.map((type) => [
    type,
    {
      schema: structureCommand.options.find(
        (schema) => schema.shape.type.value === type
      ),
      handler: 'structure' as const,
      requiredRole: 'journey:update' as const,
      requiredGrant: 'journeys:edit' as const,
      sourceChecks: ['ordinary-draft', ...sourceChecks[type]],
      dependencies: [
        'journey-revision',
        'actual-parent-chain',
        'affected-state'
      ],
      writeSet: writeSets[type],
      preserved: [
        'legacy-unmounted-content',
        'unrequested-routes',
        'unrelated-fields',
        'Host'
      ],
      effects: ['journey_content_changed'],
      inverseType: 'structure_restore' as const,
      fixtures: {
        accepted: acceptedFixtures[type],
        rejected: { ...acceptedFixtures[type], hostId: 'excluded' }
      }
    }
  ])
) as Record<
  StructureCommand['type'],
  {
    schema: (typeof structureCommand.options)[number]
    handler: 'structure'
    requiredRole: 'journey:update'
    requiredGrant: 'journeys:edit'
    sourceChecks: string[]
    dependencies: string[]
    writeSet: readonly ChangedField[]
    preserved: string[]
    effects: string[]
    inverseType: 'structure_restore'
    fixtures: { accepted: StructureCommand; rejected: unknown }
  }
>
