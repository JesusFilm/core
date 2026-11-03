import { youTubeId } from '../checkJourney'
import type {
  ContentItem,
  Journey,
  JourneyAction,
  JourneyImage
} from '../journeySchema'

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
export function journeyToBlocks(journey: Journey): PreviewBlock[] {
  const blocks: PreviewBlock[] = []

  journey.steps.forEach((step, stepIndex) => {
    blocks.push({
      __typename: 'StepBlock',
      id: step.name,
      parentBlockId: null,
      parentOrder: stepIndex,
      locked: false,
      nextBlockId: step.next ?? null,
      slug: null
    })

    const card = step.card
    const coverId = card.backgroundImage != null ? `${card.name}:cover` : null
    blocks.push({
      __typename: 'CardBlock',
      id: card.name,
      parentBlockId: step.name,
      parentOrder: 0,
      backgroundColor: card.backgroundColor ?? null,
      backdropBlur: null,
      coverBlockId: coverId,
      themeMode: card.theme ?? null,
      themeName: card.theme != null ? 'base' : null,
      fullscreen: card.fullscreen ?? false,
      eventLabel: null,
      showAssistant: false,
      expandChatByDefault: false
    })

    if (card.backgroundImage != null && coverId != null)
      blocks.push(imageBlock(coverId, card.name, null, card.backgroundImage))

    const submitButtonName = findSubmitButton(card.content)
    card.content.forEach((item, order) => {
      blocks.push(
        ...itemBlocks(item, card.name, order, {
          submitButtonName,
          next: step.next
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
  context: { submitButtonName: string | null; next: string | undefined }
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
          variant: TYPOGRAPHY_VARIANT[item.style],
          settings: null
        }
      ]
    case 'button': {
      const iconId = item.icon != null ? `${item.name}:icon` : null
      const button: PreviewBlock = {
        __typename: 'ButtonBlock',
        ...base,
        label: item.label,
        buttonVariant: item.style === 'primary' ? 'contained' : 'outlined',
        buttonColor: 'primary',
        size: 'large',
        startIconId: iconId,
        endIconId: null,
        submitEnabled: item.name === context.submitButtonName,
        action: toAction(item.action, item.name),
        settings: null,
        eventLabel: null
      }
      if (item.icon == null || iconId == null) return [button]
      return [
        button,
        {
          __typename: 'IconBlock',
          id: iconId,
          parentBlockId: item.name,
          parentOrder: null,
          iconName: item.icon,
          iconSize: null,
          iconColor: null
        }
      ]
    }
    case 'image':
      return [imageBlock(item.name, cardId, parentOrder, item.image)]
    case 'video': {
      const videoId = youTubeId(item.url)
      return [
        {
          __typename: 'VideoBlock',
          ...base,
          muted: false,
          autoplay: true,
          startAt: item.startAt ?? 0,
          endAt: item.endAt ?? null,
          posterBlockId: null,
          fullsize: true,
          videoId,
          videoVariantLanguageId: null,
          source: 'youTube',
          title: null,
          description: null,
          image:
            videoId != null
              ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
              : null,
          duration: null,
          objectFit: null,
          showGeneratedSubtitles: null,
          subtitleLanguage: null,
          mediaVideo:
            videoId != null ? { __typename: 'YouTube', id: videoId } : null,
          action:
            context.next != null
              ? toAction({ goTo: context.next }, item.name)
              : null,
          eventLabel: null,
          endEventLabel: null,
          customizable: false,
          notes: null
        }
      ]
    }
    case 'poll':
      return [
        {
          __typename: 'RadioQuestionBlock',
          ...base,
          gridView: false
        },
        ...item.options.map(
          (option, order): PreviewBlock => ({
            __typename: 'RadioOptionBlock',
            id: option.name,
            parentBlockId: item.name,
            parentOrder: order,
            label: option.label,
            action: toAction(option.action, option.name),
            pollOptionImageBlockId: null,
            eventLabel: null
          })
        )
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
          hint: null,
          minRows: null,
          type: item.kind,
          routeId: null,
          integrationId: null,
          hideLabel: false
        }
      ]
    case 'spacer':
      return [
        {
          __typename: 'SpacerBlock',
          ...base,
          spacing: SPACER_SIZE[item.size]
        }
      ]
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
    scale: null,
    focalTop: 50,
    focalLeft: 50,
    customizable: false
  }
}

function toAction(
  action: JourneyAction,
  parentBlockId: string
): Record<string, unknown> {
  if ('goTo' in action)
    return {
      __typename: 'NavigateToBlockAction',
      parentBlockId,
      gtmEventName: null,
      blockId: action.goTo
    }
  return {
    __typename: 'LinkAction',
    parentBlockId,
    gtmEventName: null,
    url: action.url,
    customizable: false,
    parentStepId: null
  }
}
