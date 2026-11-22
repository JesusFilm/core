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
