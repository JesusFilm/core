import { z } from 'zod'

import { EventLabel } from '@core/prisma/journeys/client'
import {
  BODY_FONT_OPTIONS,
  HEADER_FONT_OPTIONS,
  LABELS_FONT_OPTIONS
} from '@core/shared/ui/fontFamilies'

import { JOURNEY_DEFAULTS } from '../journeyDefaults'
import { LIBRARY_VIDEO_KEYS } from '../libraryVideos/catalog'

/**
 * v0 journey schema for the AI journey builder (ENG-3767 "Journey schema").
 *
 * Two shapes share one tree. `journeyInputSchema` is what the model reads and
 * writes: images describe a search or an existing asset, plus framing.
 * `journeySchema` is what the server checks and the browser keeps: the same,
 * plus resolved photo metadata. The model never sees that metadata;
 * `resolveImages` resolves it or reuses it by image name without replacing
 * the requested framing.
 *
 * The schemas hold shape only; rules that need the whole journey (unique
 * names, links to real steps, ...) live in `checkJourney`. Descriptions double
 * as prompt guidance, because the JSON Schema shown to the model is generated
 * from `journeyInputSchema`.
 *
 * Deliberately separate from `libs/shared/ai/src/journeySimpleTypes.ts`, which
 * `journeySimple` still uses.
 */

export const NAME_PATTERN = /^[a-z0-9-]+$/

export const nameSchema = z
  .string()
  .regex(NAME_PATTERN)
  .describe(
    'Stable lowercase-with-dashes name, unique across the whole journey, e.g. "welcome" or "prayer-poll". Never rename something that already exists.'
  )

/** Current editor icons, followed by legacy values retained for stored drafts. */
export const BUTTON_ICONS = [
  'ArrowLeftContained2',
  'ArrowRightContained2',
  'BeenhereRounded',
  'ChevronLeftRounded',
  'Home4',
  'Note2',
  'Volume5',
  'ArrowForwardRounded',
  'ArrowBackRounded',
  'ChevronRightRounded',
  'CheckCircleRounded',
  'ChatBubbleOutlineRounded',
  'ContactSupportRounded',
  'FormatQuoteRounded',
  'Launch',
  'LinkAngled',
  'LiveTvRounded',
  'LockOpenRounded',
  'MailOutline',
  'MenuBookRounded',
  'MessageChat1',
  'Phone',
  'PlayArrowRounded',
  'SendRounded',
  'SubscriptionsRounded',
  'TranslateRounded',
  'UserProfile2',
  'UsersProfiles3'
] as const

export const actionSchema = z
  .union([
    z.object({
      goTo: nameSchema.describe('Name of the step to go to'),
      gtmEventName: z.string().optional()
    }),
    z.object({
      url: z.string().describe('An http(s) link'),
      gtmEventName: z.string().optional(),
      customizable: z.boolean().optional()
    }),
    z.object({
      email: z.email(),
      gtmEventName: z.string().optional(),
      customizable: z.boolean().optional()
    }),
    z.object({
      chatUrl: z.url(),
      gtmEventName: z.string().optional(),
      customizable: z.boolean().optional()
    }),
    z.object({
      phone: z.string().min(1),
      countryCode: z
        .string()
        .regex(/^[A-Z]{2}$/)
        .optional()
        .describe('ISO country code, e.g. US or NZ'),
      contactAction: z.enum(['call', 'text']),
      gtmEventName: z.string().optional(),
      customizable: z.boolean().optional()
    }),
    z.object({ none: z.literal(true) })
  ])
  .describe(
    'Exactly one action: goTo, url, email, chatUrl, phone with contactAction, or none:true. Use only contact details provided by the user.'
  )

/** What the model writes for an image. The server finds the photo. */
export const imageInputSchema = z
  .object({
    search: z
      .string()
      .min(1)
      .optional()
      .describe('A short stock-photo search, e.g. "sunrise over hills"'),
    alt: z.string().describe('Alt text describing the image'),
    assetUrl: z
      .url()
      .optional()
      .describe(
        'Exact existing/uploaded image URL supplied by the user, never invented. Use instead of search.'
      ),
    assetWidth: z.number().positive().optional(),
    assetHeight: z.number().positive().optional(),
    scale: z
      .number()
      .int()
      .min(100)
      .max(200)
      .multipleOf(10)
      .optional()
      .describe('Image zoom percentage, 100 to 200 in steps of 10'),
    focalLeft: z.number().min(0).max(100).optional(),
    focalTop: z.number().min(0).max(100).optional(),
    customizable: z.boolean().optional()
  })
  .describe(
    'An image, found by its search. Keep the search of an existing image unless the plan changes that image; a new search means a new photo.'
  )

/** The stored image: the model's fields plus the photo the server found. */
export const imageSchema = imageInputSchema.extend({
  src: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  blurhash: z.string().optional()
})

type ImageInput = z.infer<typeof imageInputSchema>

function journeySchemaWith<TImage extends z.ZodType<ImageInput>>(
  image: TImage
) {
  const textItemSchema = z.object({
    type: z.literal('text'),
    name: nameSchema,
    content: z.string().min(1),
    style: z
      .enum(['title', 'heading', 'subtitle', 'body', 'caption'])
      .optional()
      .describe(
        'Legacy alias: title=Display, heading=Heading 1, body=Large Body. Prefer variant for new content.'
      ),
    variant: z
      .enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2', 'caption'])
      .optional()
      .describe(
        'Editor sizes: h1 Display, h2 Title, h3 Heading 1, h4 Heading 2, h5 Heading 3, h6 Heading 4, body1 Large Body, body2 Normal Body, caption Small Body. Prefer h2 for titles and body2 for normal text.'
      ),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    align: z.enum(['left', 'center', 'right']).optional()
  })

  const buttonItemSchema = z.object({
    type: z.literal('button'),
    name: nameSchema,
    label: z.string().min(1),
    style: z
      .enum(['primary', 'secondary'])
      .optional()
      .describe(
        'Legacy aliases for contained/outlined, not color. Prefer variant.'
      ),
    variant: z.enum(['contained', 'outlined', 'text']).optional(),
    color: z.enum(['primary', 'secondary', 'error']).optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    alignment: z.enum(['left', 'center', 'right', 'justify']).optional(),
    icon: z
      .enum([...BUTTON_ICONS, 'next', 'previous'])
      .optional()
      .describe(
        'Leading icon. Use next/previous for logical navigation, resolved using journey language direction. Never choose deprecated LiveTvRounded or LockOpenRounded for new blocks.'
      ),
    endIcon: z
      .enum([...BUTTON_ICONS, 'next', 'previous'])
      .optional()
      .describe(
        'Trailing icon. Prefer next for Continue/Next and previous for Back. Logical icons follow journey language direction; explicit named icons retain their physical direction.'
      ),
    iconColor: z
      .enum(['primary', 'secondary', 'action', 'error', 'disabled', 'inherit'])
      .optional(),
    endIconColor: z
      .enum(['primary', 'secondary', 'action', 'error', 'disabled', 'inherit'])
      .optional(),
    eventLabel: z.enum(EventLabel).optional(),
    action: actionSchema
      .optional()
      .describe(
        'Omit or none:true for no action. A form submit button can still submit without navigation.'
      )
  })

  const imageItemSchema = z.object({
    type: z.literal('image'),
    name: nameSchema,
    image
  })

  const videoClipSchema = z.object({
    url: z
      .string()
      .optional()
      .describe('A YouTube link; omit when using libraryVideo'),
    libraryVideo: z
      .enum(LIBRARY_VIDEO_KEYS)
      .optional()
      .describe(
        'An approved English Jesus Film library video; omit url when using this'
      ),
    libraryVideoId: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Exact library film ID supplied by the user or a previous resolved choice; never invent an ID.'
      ),
    librarySearch: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Search the published Jesus Film library by title when no seeded key or known ID matches.'
      ),
    muxVideoId: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Existing uploaded Mux asset ID supplied by the user. Uploading a new file requires the existing builder upload flow.'
      ),
    languageId: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Video audio-language ID, default English 529. Use a known language ID from the user.'
      ),
    languageName: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Audio language name such as Spanish, resolved against real languages by the server.'
      ),
    startAt: z.number().int().min(0).optional().describe('Seconds'),
    endAt: z.number().int().min(0).optional().describe('Seconds'),
    autoplay: z.boolean().optional(),
    muted: z.boolean().optional(),
    poster: image.optional(),
    subtitleLanguageId: z.string().optional(),
    subtitleLanguageBcp47: z.string().optional(),
    subtitleLanguageName: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Requested subtitle language name, resolved by the server. Subtitle availability depends on the video source.'
      ),
    showGeneratedSubtitles: z.boolean().optional(),
    notes: z.string().max(100).optional(),
    eventLabel: z.enum(EventLabel).optional(),
    endEventLabel: z.enum(EventLabel).optional(),
    customizable: z.boolean().optional(),
    objectFit: z
      .enum(['fit', 'fill', 'zoomed'])
      .optional()
      .describe(
        `Native video fit, for standalone and background videos. Default ${JOURNEY_DEFAULTS.videoObjectFit}: fill the card, cropping edges. fit: show the whole video at its original aspect ratio, allowing empty space. zoomed (called Crop in the editor): fit then zoom 1.33x. Explicit user requests override the default. Preserve existing choices on unrelated edits. YouTube always uses fit.`
      )
  })

  const videoItemSchema = z.object({
    type: z.literal('video'),
    name: nameSchema,
    ...videoClipSchema.shape,
    action: actionSchema.optional(),
    triggers: z
      .array(
        z.object({
          name: nameSchema,
          triggerStart: z.number().min(0),
          action: actionSchema
        })
      )
      .optional()
      .describe('Legacy timed video actions; use only when requested.')
  })

  const pollItemSchema = z.object({
    type: z.literal('poll'),
    name: nameSchema,
    gridView: z.boolean().optional(),
    options: z
      .array(
        z.object({
          name: nameSchema,
          label: z.string().min(1),
          action: actionSchema.optional(),
          image: image.optional(),
          eventLabel: z.enum(EventLabel).optional()
        })
      )
      .min(1)
  })

  const multiselectItemSchema = z.object({
    type: z.literal('multiselect'),
    name: nameSchema,
    options: z
      .array(z.object({ name: nameSchema, label: z.string().min(1) }))
      .min(1),
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(1).optional()
  })

  const textResponseItemSchema = z.object({
    type: z.literal('textResponse'),
    name: nameSchema,
    label: z.string().min(1),
    placeholder: z.string().optional(),
    kind: z.enum(['freeForm', 'name', 'email', 'phone']),
    required: z.boolean().optional(),
    hint: z.string().optional(),
    minRows: z.number().int().min(1).max(4).optional(),
    hideLabel: z.boolean().optional(),
    integrationId: z
      .string()
      .optional()
      .describe(
        'Existing account integration ID supplied by the user; never invent or provision an integration.'
      ),
    routeId: z
      .string()
      .optional()
      .describe('Existing integration route ID supplied by the user.')
  })

  const spacerItemSchema = z.object({
    type: z.literal('spacer'),
    name: nameSchema,
    size: z
      .enum(['small', 'medium', 'large'])
      .optional()
      .describe(
        'Fixed empty space: small 40px, medium 100px, large 160px. Not bottom alignment. Normal text and buttons already have margins; omit spacers unless extra separation is specifically needed.'
      ),
    spacing: z
      .number()
      .int()
      .min(20)
      .max(400)
      .multipleOf(10)
      .optional()
      .describe(
        'Exact editor spacing in pixels. Overrides legacy size. Omit unnecessary spacers before buttons.'
      )
  })

  const signUpItemSchema = z
    .object({
      type: z.literal('signUp'),
      name: nameSchema,
      submitLabel: z.string().min(1),
      icon: z.enum(BUTTON_ICONS).optional(),
      iconColor: buttonItemSchema.shape.iconColor,
      action: actionSchema.optional()
    })
    .describe(
      'Legacy Subscribe block, not normally offered in Add a block. Use only to reproduce an existing/requested Subscribe block.'
    )

  const contentItemSchema = z.discriminatedUnion('type', [
    textItemSchema,
    buttonItemSchema,
    imageItemSchema,
    videoItemSchema,
    pollItemSchema,
    multiselectItemSchema,
    textResponseItemSchema,
    spacerItemSchema,
    signUpItemSchema
  ])

  const cardSchema = z.object({
    name: nameSchema,
    theme: z
      .enum(['dark', 'light', 'default'])
      .optional()
      .describe(
        'Prefer dark for every card unless the user asks for light. dark (default): light text on a dark card. light: dark text on a light card.'
      ),
    backgroundColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)
      .optional()
      .describe(
        'Hex color, with optional alpha for an expanded image background, e.g. #1A2B3C80'
      ),
    backdropBlur: z
      .number()
      .min(0)
      .max(25)
      .optional()
      .describe(
        'Expanded image blur in pixels, 0 to 25; editor percentage divided by 4. Does not control the native background-video blur.'
      ),
    showAssistant: z.boolean().optional(),
    expandChatByDefault: z.boolean().optional(),
    eventLabel: z.enum(EventLabel).optional(),
    backgroundImage: image.optional(),
    backgroundVideo: videoClipSchema
      .optional()
      .describe(
        'A muted looping video behind text and buttons, using the native NextSteps blurred cover. Choose backgroundImage or backgroundVideo, not both.'
      ),
    fullscreen: z
      .boolean()
      .optional()
      .describe(
        'How the backgroundImage shows. false (the default): the photo is sharp and clear at the top of the card, with the content below it. true: the photo fills the whole card but is blurred, with the content on top of it.'
      ),
    content: z.array(contentItemSchema).describe('Card content, top to bottom')
  })

  const stepSchema = z.object({
    name: nameSchema,
    slug: z.string().optional(),
    locked: z.boolean().optional(),
    next: nameSchema
      .optional()
      .describe('Default next step name, used when nothing else navigates'),
    card: cardSchema
  })

  return z.object({
    title: z.string().min(1),
    description: z.string(),
    language: z
      .object({
        bcp47: z
          .string()
          .regex(/^[a-z]{2,3}(-[a-zA-Z0-9]{2,8})*$/)
          .describe(
            'Content language tag, e.g. en, ar, he, fa. Determines reading direction and logical navigation icons.'
          ),
        id: z
          .string()
          .optional()
          .describe('Resolved language ID; server fills when omitted.')
      })
      .optional(),
    theme: z
      .enum(['dark', 'light'])
      .optional()
      .describe('Inherited journey style. Default dark.'),
    fonts: z
      .object({
        headerFont: z.enum(HEADER_FONT_OPTIONS).optional(),
        bodyFont: z.enum(BODY_FONT_OPTIONS).optional(),
        labelFont: z.enum(LABELS_FONT_OPTIONS).optional()
      })
      .optional(),
    steps: z.array(stepSchema).min(1).describe('Steps in order')
  })
}

/** The shape the model reads and writes. */
export const journeyInputSchema = journeySchemaWith(imageInputSchema)

/** The shape the server checks and the browser keeps. */
export const journeySchema = journeySchemaWith(imageSchema)

export type Journey = z.infer<typeof journeySchema>
export type JourneyInput = z.infer<typeof journeyInputSchema>
export type JourneyStep = Journey['steps'][number]
export type JourneyCard = JourneyStep['card']
export type ContentItem = JourneyCard['content'][number]
export type JourneyImage = z.infer<typeof imageSchema>
export type JourneyAction = z.infer<typeof actionSchema>

/** The journey as the model sees it: every image is its search and alt only. */
export function journeyForModel(journey: Journey): JourneyInput {
  // Parsing strips server-only image metadata at every nesting level, including
  // covers, poll options and video posters, while retaining requested framing.
  return journeyInputSchema.parse(journey)
}
