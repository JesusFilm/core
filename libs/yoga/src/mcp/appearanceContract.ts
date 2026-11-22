import { z } from 'zod'

import fontCatalog from '@core/shared/ui/fontFamilies'

import { blockReference, localKey } from './structureContract'

const { BODY_FONT_OPTIONS, HEADER_FONT_OPTIONS, LABELS_FONT_OPTIONS } =
  fontCatalog

const text = z.string().max(262144)
const id = z.string().min(1).max(200)
const supplied = (value: object) =>
  Object.keys(value).some(
    (key) => key !== 'type' && key !== 'chatButtonId' && key !== 'block'
  )
export const appearanceJourneyFields = [
  'title',
  'description',
  'languageId',
  'seoTitle',
  'seoDescription',
  'website',
  'displayTitle',
  'menuButtonIcon',
  'showShareButton',
  'showLikeButton',
  'showDislikeButton'
] as const
export const fontFields = ['headerFont', 'bodyFont', 'labelFont'] as const
export const messagePlatform = z.enum([
  'facebook',
  'telegram',
  'whatsApp',
  'instagram',
  'kakaoTalk',
  'viber',
  'vk',
  'snapchat',
  'skype',
  'line',
  'tikTok',
  'custom',
  'globe2',
  'globe3',
  'messageText1',
  'messageText2',
  'send1',
  'send2',
  'messageChat2',
  'messageCircle',
  'messageNotifyCircle',
  'messageNotifySquare',
  'messageSquare',
  'mail1',
  'linkExternal',
  'home3',
  'home4',
  'helpCircleContained',
  'helpSquareContained',
  'shieldCheck',
  'menu1',
  'checkBroken',
  'checkContained',
  'settings',
  'discord',
  'signal',
  'weChat'
])
export const trackingLabel = z.enum([
  'custom1',
  'custom2',
  'custom3',
  'decisionForChrist',
  'gospelPresentationStart',
  'gospelPresentationComplete',
  'inviteFriend',
  'prayerRequest',
  'rsvp',
  'share',
  'specialVideoStart',
  'specialVideoComplete'
])

/** Match Admin's bare-host/email normalization, while rejecting executable URLs. */
export function normalizeChatLink(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const normalized = /^(?:https?:\/\/|mailto:|tel:|sms:)/i.test(trimmed)
    ? trimmed
    : /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(trimmed)
      ? `mailto:${trimmed}`
      : /^[\w+.-]+:/.test(trimmed)
        ? trimmed
        : `https://${trimmed}`
  const url = new URL(normalized)
  if (
    !['https:', 'http:', 'mailto:', 'tel:', 'sms:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error('VALIDATION_FAILED')
  return normalized
}
const chatLink = text.nullable().superRefine((value, context) => {
  if (value === null) return
  try {
    normalizeChatLink(value)
  } catch {
    context.addIssue({ code: 'custom', message: 'Unsupported chat link' })
  }
})
const font = (options: readonly string[]) => z.enum(options)
export const appearanceCommand = z.union([
  z
    .object({
      type: z.literal('journey_details_set'),
      title: text.min(1).optional(),
      description: text.nullable().optional(),
      languageId: id.optional()
    })
    .strict()
    .refine(supplied),
  z
    .object({
      type: z.literal('journey_social_set'),
      seoTitle: z.string().max(49).optional(),
      seoDescription: z.string().max(179).optional()
    })
    .strict()
    .refine(supplied),
  z
    .object({
      type: z.literal('journey_fonts_set'),
      headerFont: font(HEADER_FONT_OPTIONS).optional(),
      bodyFont: font(BODY_FONT_OPTIONS).optional(),
      labelFont: font(LABELS_FONT_OPTIONS).optional()
    })
    .strict()
    .refine(supplied),
  z
    .object({
      type: z.literal('journey_appearance_set'),
      website: z.boolean().optional(),
      displayTitle: text.nullable().optional(),
      menuButtonIcon: z
        .enum([
          'menu1',
          'equals',
          'home3',
          'home4',
          'more',
          'ellipsis',
          'grid1',
          'chevronDown'
        ])
        .nullable()
        .optional(),
      showShareButton: z.boolean().optional(),
      showLikeButton: z.boolean().optional(),
      showDislikeButton: z.boolean().optional()
    })
    .strict()
    .refine(supplied),
  z.object({ type: z.literal('menu_create'), key: localKey }).strict(),
  z.object({ type: z.literal('menu_remove') }).strict(),
  z
    .object({
      type: z.literal('chat_button_add'),
      key: localKey,
      platform: messagePlatform.nullable(),
      link: chatLink
    })
    .strict(),
  z
    .object({
      type: z.literal('chat_button_set'),
      chatButtonId: id,
      platform: messagePlatform.nullable().optional(),
      link: chatLink.optional()
    })
    .strict()
    .refine(supplied),
  z
    .object({ type: z.literal('chat_button_remove'), chatButtonId: id })
    .strict(),
  z
    .object({
      type: z.literal('tracking_set'),
      block: blockReference,
      eventLabel: trackingLabel.nullable().optional(),
      endEventLabel: trackingLabel.nullable().optional()
    })
    .strict()
    .refine(supplied)
])
export type AppearanceCommand = z.infer<typeof appearanceCommand>
export const appearanceCommandNames = [
  'journey_details_set',
  'journey_social_set',
  'journey_fonts_set',
  'journey_appearance_set',
  'menu_create',
  'menu_remove',
  'chat_button_add',
  'chat_button_set',
  'chat_button_remove',
  'tracking_set'
] as const
export function isAppearanceCommand(value: {
  type: string
}): value is AppearanceCommand {
  return (appearanceCommandNames as readonly string[]).includes(value.type)
}

export const appearanceChangedFields = [
  ...appearanceJourneyFields,
  ...fontFields,
  'platform',
  'link',
  'removed',
  'eventLabel',
  'endEventLabel'
] as const

const appearanceRows = {
  journey_details_set: {
    controls: ['Journey title', 'Journey description', 'Journey language'],
    writeSet: ['Journey.title', 'Journey.description', 'Journey.languageId'],
    flags: [],
    sources: ['current-language-catalog-reference'],
    fixture: { type: 'journey_details_set', title: 'Title', languageId: '529' }
  },
  journey_social_set: {
    controls: ['Social preview title', 'Social preview description'],
    writeSet: ['Journey.seoTitle', 'Journey.seoDescription'],
    flags: [],
    sources: ['social-title-max-49', 'social-description-max-179'],
    fixture: { type: 'journey_social_set', seoTitle: 'Preview' }
  },
  journey_fonts_set: {
    controls: ['Header font', 'Body font', 'Label font'],
    writeSet: [
      'JourneyTheme.create',
      'JourneyTheme.headerFont',
      'JourneyTheme.bodyFont',
      'JourneyTheme.labelFont'
    ],
    flags: [],
    sources: ['role-specific-curated-font-catalog', 'unique-owned-theme'],
    fixture: { type: 'journey_fonts_set', headerFont: 'Montserrat' }
  },
  journey_appearance_set: {
    controls: [
      'Website mode',
      'Display title',
      'Menu icon',
      'Share reaction',
      'Like reaction',
      'Dislike reaction'
    ],
    writeSet: [
      'Journey.website',
      'Journey.displayTitle',
      'Journey.menuButtonIcon',
      'Journey.showShareButton',
      'Journey.showLikeButton',
      'Journey.showDislikeButton'
    ],
    flags: ['websiteMode: website/menu icon changes'],
    sources: ['menu-icon-requires-website', 'reactions-require-nonwebsite'],
    fixture: { type: 'journey_appearance_set', website: true }
  },
  menu_create: {
    controls: ['Create website menu'],
    writeSet: [
      'StepBlock.create',
      'CardBlock.create',
      'TypographyBlock.create:2',
      'ButtonBlock.create:3',
      'StepBlock.parentOrder',
      'Journey.menuStepBlockId'
    ],
    flags: ['websiteMode'],
    sources: [
      'website-mode',
      'no-existing-menu',
      'twenty-step-bound',
      'step-order-int-bound',
      'unique-batch-local-namespace'
    ],
    fixture: { type: 'menu_create', key: 'menu' }
  },
  menu_remove: {
    controls: ['Remove website menu'],
    writeSet: [
      'owned-menu-descendants.deletedAt',
      'retained-siblings.parentOrder',
      'Journey.menuStepBlockId'
    ],
    flags: ['websiteMode'],
    sources: [
      'website-mode',
      'live-owned-menu-step',
      'complete-owned-descendants'
    ],
    fixture: { type: 'menu_remove' }
  },
  chat_button_add: {
    controls: ['Add chat link'],
    writeSet: ['ChatButton.create'],
    flags: [],
    sources: [
      'two-chat-button-bound',
      'mounted-platform-enum',
      'normalized-safe-link'
    ],
    fixture: { type: 'chat_button_add', key: 'chat', platform: null, link: '' }
  },
  chat_button_set: {
    controls: ['Chat platform', 'Chat link'],
    writeSet: ['ChatButton.platform', 'ChatButton.link'],
    flags: [],
    sources: [
      'owned-chat-button',
      'mounted-platform-enum',
      'normalized-safe-link'
    ],
    fixture: { type: 'chat_button_set', chatButtonId: 'chat', link: null }
  },
  chat_button_remove: {
    controls: ['Remove chat link'],
    writeSet: ['ChatButton.delete'],
    flags: [],
    sources: ['owned-chat-button', 'complete-row-history-conflict-check'],
    fixture: { type: 'chat_button_remove', chatButtonId: 'chat' }
  },
  tracking_set: {
    controls: [
      'Card tracking label',
      'Button tracking label',
      'Poll option tracking label',
      'Video start/end tracking labels'
    ],
    writeSet: ['Block.eventLabel', 'VideoBlock.endEventLabel'],
    flags: ['editJourneyTrackingMetrics'],
    sources: ['mounted-block-kind', 'mounted-position', 'mounted-label-enum'],
    fixture: { type: 'tracking_set', block: { id: 'card' }, eventLabel: null }
  }
} as const satisfies Record<
  AppearanceCommand['type'],
  {
    controls: readonly string[]
    writeSet: readonly string[]
    flags: readonly string[]
    sources: readonly string[]
    fixture: AppearanceCommand
  }
>

/** Release rows bind each enabled schema to its actual owner and evidence.
 * Media controls remain registered by their composed owned-slot handlers. */
function appearanceRow(type: AppearanceCommand['type']) {
  const row = appearanceRows[type]
  return {
    schema: appearanceCommand.options.find(
      (option) => option.shape.type.value === type
    )!,
    handler: 'apis/api-journeys/src/lib/mcpStructure.ts:planStructure',
    planners: [
      'apis/api-journeys/src/lib/mcpAppearance.ts:appearancePlanner',
      'apis/api-journeys/src/lib/mcpAppearanceEntities.ts:appearanceEntities'
    ],
    mountedControls: row.controls,
    requiredRole: 'journey:update',
    requiredGrant: 'journeys:edit',
    featureChecks: row.flags,
    sourceChecks: ['ordinary-draft', 'live-owned-journey', ...row.sources],
    dependencies: [
      'journey-revision',
      'current-authorization-generations',
      'payload-bound-operation-key',
      'affected-field-history'
    ],
    writeSet: row.writeSet,
    preserved: [
      'unrequested-fields',
      'Host',
      'creator-template-lifecycle-share-admin',
      'integration-credentials'
    ],
    effects: ['journey_content_changed'],
    inverseType: 'structure_restore',
    evidence: {
      positive:
        'apis/api-auth/test/grantedAppearance.spec.ts: supported fields, menu recipe, fonts, chats and tracking',
      negative:
        'apis/api-auth/test/grantedAppearance.spec.ts: rejects stale, read-only, role-ineligible and published writes without effects',
      replay:
        'apis/api-auth/test/grantedAppearance.spec.ts: stable replay/history IDs and lost font/chat response',
      race: 'apis/api-auth/test/grantedAppearance.spec.ts: current feature checks at acceptance, affected-field history conflicts and child-write rollback',
      deferred: [
        'normal Admin browser',
        'private playback',
        'live identities/providers',
        'assembled release qualification'
      ]
    },
    fixtures: {
      accepted: row.fixture,
      rejected: { ...row.fixture, hostId: 'excluded' }
    }
  }
}

export const appearanceCommandRegistry = {
  journey_details_set: appearanceRow('journey_details_set'),
  journey_social_set: appearanceRow('journey_social_set'),
  journey_fonts_set: appearanceRow('journey_fonts_set'),
  journey_appearance_set: appearanceRow('journey_appearance_set'),
  menu_create: appearanceRow('menu_create'),
  menu_remove: appearanceRow('menu_remove'),
  chat_button_add: appearanceRow('chat_button_add'),
  chat_button_set: appearanceRow('chat_button_set'),
  chat_button_remove: appearanceRow('chat_button_remove'),
  tracking_set: appearanceRow('tracking_set')
} satisfies Record<AppearanceCommand['type'], ReturnType<typeof appearanceRow>>
