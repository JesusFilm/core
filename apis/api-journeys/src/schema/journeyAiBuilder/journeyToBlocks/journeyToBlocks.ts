import { getLocaleRTL } from '@core/shared/ui/rtl'

import { youTubeId } from '../checkJourney'
import { JOURNEY_DEFAULTS } from '../journeyDefaults'
import type {
  ContentItem,
  Journey,
  JourneyAction,
  JourneyImage
} from '../journeySchema'
import {
  type ResolvedLibraryVideos,
  videoLookupKey
} from '../libraryVideos/catalog'

/**
 * A block in the shape of the journeys-ui `BlockFields` GraphQL fragment, so
 * the chat page can hand the list straight to `transformer` + `BlockRenderer`.
 * Kept as a loose record here because api-journeys cannot import journeys-ui.
 */
export type PreviewBlock = {
  __typename: string
  id: string
  parentBlockId: string | null
  parentOrder: number | null
} & Record<string, unknown>

/**
 * Pure converter from v0 journey JSON to a flat block list. No database.
 *
 * Block ids are the journey's stable names. Blocks with no name of their own
 * (button icons, card cover images) get `<owner name>:<role>`, which can never
 * clash with a name because names only allow [a-z0-9-]. Chunk 3 maps these
 * ids onto real database ids.
 */
export function journeyToBlocks(
  journey: Journey,
  libraryVideos: ResolvedLibraryVideos = {}
): PreviewBlock[] {
  const blocks: PreviewBlock[] = []

  journey.steps.forEach((step, stepIndex) => {
    blocks.push({
      __typename: 'StepBlock',
      id: step.name,
      parentBlockId: null,
      parentOrder: stepIndex,
      locked: step.locked ?? false,
      nextBlockId: step.next ?? null,
      slug: step.slug ?? null
    })

    const card = step.card
    const coverId =
      card.backgroundImage != null || card.backgroundVideo != null
        ? `${card.name}:cover`
        : null
    blocks.push({
      __typename: 'CardBlock',
      id: card.name,
      parentBlockId: step.name,
      parentOrder: 0,
      backgroundColor: card.backgroundColor ?? null,
      backdropBlur: card.backdropBlur ?? null,
      coverBlockId: coverId,
      themeMode:
        card.theme === 'default'
          ? null
          : (card.theme ?? journey.theme ?? JOURNEY_DEFAULTS.theme),
      themeName: 'base',
      fullscreen: card.fullscreen ?? false,
      eventLabel: card.eventLabel ?? null,
      showAssistant: card.showAssistant ?? false,
      expandChatByDefault: card.expandChatByDefault ?? false
    })

    if (card.backgroundImage != null && coverId != null)
      blocks.push(imageBlock(coverId, card.name, null, card.backgroundImage))

    if (card.backgroundVideo != null && coverId != null) {
      blocks.push(
        ...itemBlocks(
          { type: 'video', name: coverId, ...card.backgroundVideo },
          card.name,
          0,
          {
            submitButtonName: null,
            next: undefined,
            libraryVideos,
            rtl: getLocaleRTL(journey.language?.bcp47 ?? 'en')
          }
        ).map((block) => ({
          ...block,
          parentOrder: null,
          muted: true,
          autoplay: true,
          action: null
        }))
      )
    }

    const submitButtonName = findSubmitButton(card.content)
    card.content.forEach((item, order) => {
      blocks.push(
        ...itemBlocks(item, card.name, order, {
          submitButtonName,
          next: step.next,
          libraryVideos,
          rtl: getLocaleRTL(journey.language?.bcp47 ?? 'en')
        })
      )
    })
  })

  return blocks
}

const TYPOGRAPHY_VARIANT = {
  title: 'h1',
  heading: 'h3',
  subtitle: 'subtitle1',
  body: 'body1',
  caption: 'caption'
} as const

const SPACER_SIZE = { small: 40, medium: 100, large: 160 } as const

function itemBlocks(
  item: ContentItem,
  cardId: string,
  parentOrder: number,
  context: {
    submitButtonName: string | null
    next: string | undefined
    libraryVideos: ResolvedLibraryVideos
    rtl: boolean
  }
): PreviewBlock[] {
  const base = { id: item.name, parentBlockId: cardId, parentOrder }

  switch (item.type) {
    case 'text':
      return [
        {
          __typename: 'TypographyBlock',
          ...base,
          align: item.align ?? null,
          color: null,
          content: item.content,
          variant:
            item.variant ??
            (item.style != null ? TYPOGRAPHY_VARIANT[item.style] : 'body2'),
          settings:
            item.color != null
              ? { __typename: 'TypographyBlockSettings', color: item.color }
              : null
        }
      ]
    case 'button': {
      const iconId = item.icon != null ? `${item.name}:icon` : null
      const endIconId = item.endIcon != null ? `${item.name}:end-icon` : null
      const button: PreviewBlock = {
        __typename: 'ButtonBlock',
        ...base,
        label: item.label,
        buttonVariant:
          item.variant ??
          (item.style === 'secondary' ? 'outlined' : 'contained'),
        buttonColor: item.color ?? 'primary',
        size: item.size ?? (item.style != null ? 'large' : 'medium'),
        startIconId: iconId,
        endIconId,
        submitEnabled: item.name === context.submitButtonName,
        action: toAction(item.action, item.name),
        settings:
          item.alignment != null
            ? { __typename: 'ButtonBlockSettings', alignment: item.alignment }
            : null,
        eventLabel: item.eventLabel ?? null
      }
      return [
        button,
        ...iconBlocks(
          iconId,
          item.name,
          item.icon,
          item.iconColor,
          context.rtl
        ),
        ...iconBlocks(
          endIconId,
          item.name,
          item.endIcon,
          item.endIconColor,
          context.rtl
        )
      ]
    }
    case 'image':
      return [imageBlock(item.name, cardId, parentOrder, item.image)]
    case 'video': {
      const lookupKey = videoLookupKey(item)
      const library =
        lookupKey != null ? context.libraryVideos[lookupKey] : undefined
      if (lookupKey != null && library == null)
        throw new Error(`Library video ${lookupKey} has not been resolved`)
      const videoId = library?.id ?? youTubeId(item.url ?? '')
      return [
        {
          __typename: 'VideoBlock',
          ...base,
          muted: item.muted ?? false,
          autoplay: item.autoplay ?? true,
          startAt: item.startAt ?? 0,
          endAt: item.endAt ?? null,
          posterBlockId: item.poster != null ? `${item.name}:poster` : null,
          fullsize: true,
          videoId,
          videoVariantLanguageId:
            library != null ? (library.languageId ?? '529') : null,
          source: library?.source ?? (library != null ? 'internal' : 'youTube'),
          title: library?.title ?? null,
          description: null,
          image:
            library != null
              ? library.poster
              : videoId != null
                ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                : null,
          duration: library?.duration ?? null,
          objectFit: item.objectFit ?? JOURNEY_DEFAULTS.videoObjectFit,
          showGeneratedSubtitles: item.showGeneratedSubtitles ?? null,
          subtitleLanguage:
            item.subtitleLanguageId != null
              ? {
                  __typename: 'Language',
                  id: item.subtitleLanguageId,
                  bcp47: item.subtitleLanguageBcp47 ?? null
                }
              : null,
          mediaVideo:
            library?.source === 'mux'
              ? {
                  __typename: 'MuxVideo',
                  id: library.id,
                  assetId: library.assetId,
                  playbackId: library.playbackId
                }
              : library != null
                ? {
                    __typename: 'Video',
                    id: library.id,
                    title: [{ __typename: 'VideoTitle', value: library.title }],
                    images:
                      library.poster != null
                        ? [
                            {
                              __typename: 'CloudflareImage',
                              mobileCinematicHigh: library.poster
                            }
                          ]
                        : [],
                    variant: {
                      __typename: 'VideoVariant',
                      id: library.variantId,
                      hls: library.hls
                    },
                    variantLanguages: [
                      {
                        __typename: 'Language',
                        id: library.languageId ?? '529',
                        name: [
                          {
                            __typename: 'LanguageName',
                            value: library.languageName ?? 'English',
                            primary: true
                          }
                        ]
                      }
                    ]
                  }
                : videoId != null
                  ? { __typename: 'YouTube', id: videoId }
                  : null,
          action:
            item.action != null
              ? toAction(item.action, item.name)
              : context.next != null
                ? toAction({ goTo: context.next }, item.name)
                : null,
          eventLabel: item.eventLabel ?? null,
          endEventLabel: item.endEventLabel ?? null,
          customizable: item.customizable ?? false,
          notes: item.notes ?? null
        },
        ...(item.poster != null
          ? [imageBlock(`${item.name}:poster`, item.name, null, item.poster)]
          : []),
        ...(item.triggers ?? []).map(
          (trigger): PreviewBlock => ({
            __typename: 'VideoTriggerBlock',
            id: trigger.name,
            parentBlockId: item.name,
            parentOrder: null,
            triggerStart: trigger.triggerStart,
            triggerAction: toAction(trigger.action, trigger.name)
          })
        )
      ]
    }
    case 'poll':
      return [
        {
          __typename: 'RadioQuestionBlock',
          ...base,
          gridView:
            item.gridView ?? item.options.some((option) => option.image != null)
        },
        ...item.options.flatMap((option, order): PreviewBlock[] => [
          {
            __typename: 'RadioOptionBlock',
            id: option.name,
            parentBlockId: item.name,
            parentOrder: order,
            label: option.label,
            action: toAction(option.action, option.name),
            pollOptionImageBlockId:
              option.image != null ? `${option.name}:image` : null,
            eventLabel: option.eventLabel ?? null
          },
          ...(option.image != null
            ? [
                imageBlock(
                  `${option.name}:image`,
                  option.name,
                  null,
                  option.image
                )
              ]
            : [])
        ])
      ]
    case 'multiselect':
      return [
        {
          __typename: 'MultiselectBlock',
          ...base,
          min: item.min ?? null,
          max: item.max ?? null
        },
        ...item.options.map(
          (option, order): PreviewBlock => ({
            __typename: 'MultiselectOptionBlock',
            id: option.name,
            parentBlockId: item.name,
            parentOrder: order,
            label: option.label
          })
        )
      ]
    case 'textResponse':
      return [
        {
          __typename: 'TextResponseBlock',
          ...base,
          required: item.required ?? false,
          label: item.label,
          placeholder: item.placeholder ?? null,
          hint: item.hint ?? null,
          minRows: item.minRows ?? null,
          type: item.kind,
          routeId: item.routeId ?? null,
          integrationId: item.integrationId ?? null,
          hideLabel: item.hideLabel ?? false
        }
      ]
    case 'spacer':
      return [
        {
          __typename: 'SpacerBlock',
          ...base,
          spacing:
            item.spacing ?? (item.size != null ? SPACER_SIZE[item.size] : 40)
        }
      ]
    case 'signUp': {
      const iconId = item.icon != null ? `${item.name}:icon` : null
      return [
        {
          __typename: 'SignUpBlock',
          ...base,
          submitLabel: item.submitLabel,
          submitIconId: iconId,
          action: toAction(item.action, item.name)
        },
        ...iconBlocks(iconId, item.name, item.icon, item.iconColor)
      ]
    }
  }
}

/**
 * The one button that submits the card's input, as the editor would make it:
 * the first button after the first text response or multiselect. Every other
 * button on the card stays an ordinary button.
 */
function findSubmitButton(content: ContentItem[]): string | null {
  const inputIndex = content.findIndex(
    (item) => item.type === 'textResponse' || item.type === 'multiselect'
  )
  if (inputIndex === -1) return null
  const button = content
    .slice(inputIndex + 1)
    .find((item) => item.type === 'button')
  return button?.name ?? null
}

function imageBlock(
  id: string,
  parentBlockId: string,
  parentOrder: number | null,
  image: JourneyImage
): PreviewBlock {
  return {
    __typename: 'ImageBlock',
    id,
    parentBlockId,
    parentOrder,
    src: image.src ?? null,
    alt: image.alt,
    width: image.width ?? 0,
    height: image.height ?? 0,
    blurhash: image.blurhash ?? '',
    scale: image.scale ?? null,
    focalTop: image.focalTop ?? 50,
    focalLeft: image.focalLeft ?? 50,
    customizable: image.customizable ?? false
  }
}

function toAction(
  action: JourneyAction | undefined,
  parentBlockId: string
): Record<string, unknown> | null {
  if (action == null || 'none' in action) return null
  const base = { parentBlockId, gtmEventName: action.gtmEventName ?? null }
  if ('goTo' in action)
    return {
      __typename: 'NavigateToBlockAction',
      parentBlockId,
      gtmEventName: action.gtmEventName ?? null,
      blockId: action.goTo
    }
  if ('email' in action)
    return {
      __typename: 'EmailAction',
      ...base,
      email: action.email,
      customizable: action.customizable ?? false,
      parentStepId: null
    }
  if ('chatUrl' in action)
    return {
      __typename: 'ChatAction',
      ...base,
      chatUrl: action.chatUrl,
      customizable: action.customizable ?? false,
      parentStepId: null
    }
  if ('phone' in action)
    return {
      __typename: 'PhoneAction',
      ...base,
      phone: action.phone,
      countryCode: action.countryCode ?? 'US',
      contactAction: action.contactAction,
      customizable: action.customizable ?? false,
      parentStepId: null
    }
  return {
    __typename: 'LinkAction',
    parentBlockId,
    gtmEventName: action.gtmEventName ?? null,
    url: action.url,
    customizable: action.customizable ?? false,
    parentStepId: null
  }
}

function iconBlocks(
  id: string | null,
  parentBlockId: string,
  name: string | undefined,
  color: string | undefined,
  rtl = false
): PreviewBlock[] {
  if (id == null || name == null) return []
  return [
    {
      __typename: 'IconBlock',
      id,
      parentBlockId,
      parentOrder: null,
      iconName:
        name === 'next'
          ? rtl
            ? 'ChevronLeftRounded'
            : 'ChevronRightRounded'
          : name === 'previous'
            ? rtl
              ? 'ChevronRightRounded'
              : 'ChevronLeftRounded'
            : name,
      iconSize: null,
      iconColor: color ?? null
    }
  ]
}
