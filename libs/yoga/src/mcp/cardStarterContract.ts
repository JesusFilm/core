import { z } from 'zod'

import { type MediaCommand, imageSource, videoSource } from './mediaContract'
import {
  buttonIconCommand,
  cardCommand,
  plainText
} from './presentationContract'
import {
  type ContentCreate,
  type StructureCommand,
  blockReference,
  localKey
} from './structureContract'

const text = plainText.optional()
const title = { eyebrow: text, title: text }

export const cardStarterCommand = z
  .object({
    type: z.literal('card_starter_apply'),
    card: blockReference,
    key: localKey.max(20),
    starter: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('video'), source: videoSource }).strict(),
      z
        .object({
          kind: z.literal('intro'),
          source: videoSource,
          ...title,
          body: text,
          button: text
        })
        .strict(),
      z
        .object({
          kind: z.literal('poll'),
          source: imageSource,
          ...title,
          options: z
            .tuple([plainText, plainText, plainText, plainText])
            .optional(),
          caption: text
        })
        .strict(),
      z
        .object({
          kind: z.literal('form'),
          source: imageSource,
          ...title,
          responseLabel: z.string().max(250).optional(),
          submitLabel: text,
          caption: text
        })
        .strict(),
      z
        .object({
          kind: z.literal('quote'),
          source: imageSource,
          eyebrow: text,
          quote: text,
          attribution: text
        })
        .strict(),
      z
        .object({
          kind: z.literal('cta'),
          source: imageSource,
          ...title,
          chat: text,
          email: text,
          more: text
        })
        .strict()
    ])
  })
  .strict()

export type CardStarterCommand = z.infer<typeof cardStarterCommand>
type ButtonIcon = z.infer<typeof buttonIconCommand>
type StarterOperation =
  | StructureCommand
  | MediaCommand
  | ButtonIcon
  | z.infer<typeof cardCommand>

type StarterPlan = {
  commands: StarterOperation[]
  secondaryText?: string
}

const sampleVideoClip = { startAt: 2048, endAt: 2058 }

/** Expand the Admin CardTemplates into the owning edit planner's commands.
 * Sources stay explicit so a starter never assumes its sample asset is available
 * or grants access to it. The owner validates every source at save time. */
export function expandCardStarter({
  card,
  key,
  starter
}: CardStarterCommand): StarterPlan {
  const ref = (part: string) => ({ local: `${key}_${part}` })
  const blockId = (part: string) => `$${ref(part).local}`
  const add = (part: string, content: ContentCreate): StarterOperation => ({
    type: 'block_add',
    key: ref(part).local,
    card,
    placement: { position: 'end' },
    content
  })
  const typography = (
    part: string,
    value: string,
    variant: Extract<ContentCreate, { kind: 'typography' }>['variant']
  ) => add(part, { kind: 'typography', content: value, variant })
  const button = (
    part: string,
    label: string,
    style: Omit<
      Extract<ContentCreate, { kind: 'button' }>,
      'kind' | 'label'
    > = {}
  ) => add(part, { kind: 'button', label, ...style })
  const icon = (
    part: string,
    slot: ButtonIcon['slot'],
    name: ButtonIcon['name']
  ): StarterOperation => ({
    type: 'button_icon_set',
    blockId: blockId(part),
    slot,
    name
  })
  const textPair = (
    eyebrow: string,
    heading: string,
    level: 'h1' | 'h2' | 'h3'
  ) => [
    typography('eyebrow', eyebrow, 'h6'),
    typography('title', heading, level)
  ]
  const videoClip =
    starter.source.source === 'internal' &&
    starter.source.videoId === '1_jf-0-0' &&
    starter.source.languageId === '529'
      ? sampleVideoClip
      : {}
  const cover = (
    media: Extract<MediaCommand, { type: 'media_slot_set' }>['media']
  ): StarterOperation => ({
    type: 'media_slot_set',
    target: { slot: 'cover', owner: card },
    media
  })
  const styledCover = (
    fullscreen: boolean,
    source: z.infer<typeof imageSource>
  ): StarterOperation[] => [
    {
      type: 'card_set',
      blockId: 'id' in card ? card.id : `$${card.local}`,
      fullscreen,
      themeMode: 'dark',
      ...(fullscreen ? {} : { backgroundColor: '#0E1412' })
    },
    cover({ kind: 'image', source })
  ]
  const recipe = (
    commands: StarterOperation[],
    secondaryText?: string
  ): StarterPlan => ({
    commands,
    ...(secondaryText ? { secondaryText: ref(secondaryText).local } : {})
  })
  switch (starter.kind) {
    case 'video':
      return recipe([
        add('video', { kind: 'video' }),
        {
          type: 'video_source_set',
          block: ref('video'),
          source: starter.source,
          settings: { ...videoClip, autoplay: true, muted: false }
        }
      ])
    case 'intro':
      return recipe([
        ...textPair(
          starter.eyebrow ?? 'Interactive Video',
          starter.title ?? "Jesus: History's Most Influential Figure?",
          'h1'
        ),
        typography(
          'body',
          starter.body ??
            'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.',
          'body1'
        ),
        button('begin', starter.button ?? 'Begin the Journey'),
        icon('begin', 'end', 'ArrowForwardRounded'),
        cover({ kind: 'video', source: starter.source, settings: videoClip })
      ])
    case 'poll':
      return recipe(
        [
          ...styledCover(true, starter.source),
          ...textPair(
            starter.eyebrow ?? 'Got an Opinion?',
            starter.title ??
              "Which of Jesus' teachings challenges you the most?",
            'h2'
          ),
          add('question', {
            kind: 'poll',
            options: (
              starter.options ?? [
                'Turning the other cheek',
                'Loving your enemies',
                'Not worrying about tomorrow',
                'Seeking first the kingdom of God'
              ]
            ).map((label, index) => ({
              key: ref(`option_${index + 1}`).local,
              label
            }))
          }),
          typography(
            'caption',
            starter.caption ?? '↑ Select an answer to continue',
            'caption'
          )
        ],
        'caption'
      )
    case 'form':
      return recipe(
        [
          ...styledCover(true, starter.source),
          ...textPair(
            starter.eyebrow ?? 'Prayer Request',
            starter.title ?? 'How can we pray for you?',
            'h1'
          ),
          add('response', {
            kind: 'response',
            label: starter.responseLabel ?? 'My Prayer:'
          }),
          button('submit', starter.submitLabel ?? ''),
          typography(
            'caption',
            starter.caption ??
              "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
            'caption'
          )
        ],
        'caption'
      )
    case 'quote':
      return recipe(
        [
          ...styledCover(false, starter.source),
          ...textPair(
            starter.eyebrow ?? 'The Bible Says:',
            starter.quote ??
              'Blessed are the peacemakers, for they shall be called sons of God.',
            'h3'
          ),
          typography(
            'attribution',
            starter.attribution ?? '– Jesus Christ',
            'body1'
          )
        ],
        'attribution'
      )
    case 'cta':
      return recipe([
        ...styledCover(false, starter.source),
        ...textPair(
          starter.eyebrow ?? "Let's Connect",
          starter.title ?? "From 'hello' to heartfelt conversations",
          'h3'
        ),
        button('chat', starter.chat ?? 'Chat with us', { size: 'large' }),
        icon('chat', 'start', 'ChatBubbleOutlineRounded'),
        button('email', starter.email ?? 'Email us', { size: 'large' }),
        icon('email', 'start', 'SendRounded'),
        button('more', starter.more ?? 'More about us', {
          variant: 'text',
          color: 'secondary',
          size: 'large'
        }),
        icon('more', 'start', 'ArrowForwardRounded')
      ])
  }
}
