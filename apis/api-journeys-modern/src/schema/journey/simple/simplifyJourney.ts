import type { Prisma } from '@core/prisma/journeys/client'
import type {
  JourneySimple,
  JourneySimpleAction,
  JourneySimpleBlock,
  JourneySimpleCard
} from '@core/shared/ai/journeySimpleTypes'

type Block = Prisma.JourneyGetPayload<{
  include: { blocks: { include: { action: true } } }
}>['blocks'][number]

type StepBlock = Block & { typename: 'StepBlock' }

/** Generate a content-derived card ID from heading/text content */
function generateCardIds(
  cards: Array<{ heading?: string; firstText?: string }>
): string[] {
  const usedIds = new Set<string>()
  return cards.map((card) => {
    const label = card.heading ?? card.firstText ?? 'untitled'
    const slug =
      label
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join('-') || 'untitled'
    let id = `card-${slug}`
    let counter = 2
    while (usedIds.has(id)) {
      id = `card-${slug}-${counter++}`
    }
    usedIds.add(id)
    return id
  })
}

/** Map a Prisma Action to a JourneySimpleAction */
function mapActionReverse(
  action: Block['action'],
  stepBlocks: StepBlock[],
  cardIds: string[]
): JourneySimpleAction | undefined {
  if (!action) return undefined
  if (action.blockId) {
    const idx = stepBlocks.findIndex((s) => s.id === action.blockId)
    if (idx >= 0) return { kind: 'navigate', cardId: cardIds[idx] }
  }
  if (action.url) return { kind: 'url', url: action.url }
  if (action.email) return { kind: 'email', email: action.email }
  // chatUrl check comes before phone since chatUrl is more specific
  if ((action as Record<string, unknown>).chatUrl)
    return {
      kind: 'chat',
      chatUrl: (action as Record<string, unknown>).chatUrl as string
    }
  if (action.phone) {
    const phoneAction: JourneySimpleAction = {
      kind: 'phone',
      phone: action.phone,
      ...(action.countryCode ? { countryCode: action.countryCode } : {}),
      ...(action.contactAction === 'call' || action.contactAction === 'text'
        ? { contactAction: action.contactAction }
        : {})
    }
    return phoneAction
  }
  return undefined
}

/** Sort blocks by parentOrder (null → Infinity) */
function sortByParentOrder(blocks: Block[]): Block[] {
  return [...blocks].sort(
    (a, b) =>
      (a.parentOrder ?? Infinity) - (b.parentOrder ?? Infinity)
  )
}

export function simplifyJourney(
  journey: Prisma.JourneyGetPayload<{
    include: { blocks: { include: { action: true } } }
  }>
): JourneySimple {
  const stepBlocks = journey.blocks.filter(
    (block): block is Block & { typename: 'StepBlock' } =>
      block.typename === 'StepBlock'
  )

  // Pre-compute card metadata for ID generation
  const cardMeta = stepBlocks.map((stepBlock) => {
    const cardBlock = journey.blocks.find(
      (b) => b.parentBlockId === stepBlock.id
    )
    if (!cardBlock) return { heading: undefined, firstText: undefined }
    const children = sortByParentOrder(
      journey.blocks.filter((b) => b.parentBlockId === cardBlock.id)
    )
    const headingBlock = children.find(
      (b) =>
        b.typename === 'TypographyBlock' &&
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(b.variant ?? '')
    )
    const textBlock = children.find(
      (b) =>
        b.typename === 'TypographyBlock' &&
        !['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(b.variant ?? '')
    )
    return {
      heading: headingBlock?.content ?? undefined,
      firstText: textBlock?.content ?? undefined
    }
  })

  const cardIds = generateCardIds(cardMeta)

  const cards: JourneySimpleCard[] = stepBlocks.map((stepBlock, index) => {
    const cardBlock = journey.blocks.find(
      (b) => b.parentBlockId === stepBlock.id
    )
    if (!cardBlock) throw new Error('Card block not found')

    const childBlocks = sortByParentOrder(
      journey.blocks.filter((b) => b.parentBlockId === cardBlock.id)
    )

    // Build content array from child blocks
    const content: JourneySimpleBlock[] = []

    for (const block of childBlocks) {
      // Skip cover blocks (handled separately as backgroundImage/backgroundVideo)
      if (block.id === cardBlock.coverBlockId) continue

      switch (block.typename) {
        case 'TypographyBlock': {
          const variant = block.variant ?? 'body1'
          const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
            variant
          )
          if (isHeading) {
            content.push({
              type: 'heading',
              text: block.content ?? '',
              variant: variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
            })
          } else {
            content.push({
              type: 'text',
              text: block.content ?? '',
              variant: variant as
                | 'body1'
                | 'body2'
                | 'subtitle1'
                | 'subtitle2'
                | 'caption'
                | 'overline'
            })
          }
          break
        }

        case 'ButtonBlock': {
          const action = mapActionReverse(
            block.action,
            stepBlocks,
            cardIds
          )
          if (action) {
            content.push({
              type: 'button',
              text: block.label ?? '',
              action
            })
          }
          break
        }

        case 'ImageBlock': {
          content.push({
            type: 'image',
            src: block.src ?? '',
            alt: block.alt ?? '',
            ...(block.width != null ? { width: block.width } : {}),
            ...(block.height != null ? { height: block.height } : {}),
            ...(block.blurhash ? { blurhash: block.blurhash } : {})
          })
          break
        }

        case 'VideoBlock': {
          if (block.source === 'youTube' && block.videoId) {
            content.push({
              type: 'video',
              url: `https://youtube.com/watch?v=${block.videoId}`,
              ...(block.startAt != null ? { startAt: block.startAt } : {}),
              ...(block.endAt != null ? { endAt: block.endAt } : {})
            })
          }
          break
        }

        case 'RadioQuestionBlock': {
          const optionBlocks = sortByParentOrder(
            journey.blocks.filter(
              (b) =>
                b.typename === 'RadioOptionBlock' &&
                b.parentBlockId === block.id
            )
          )
          const options = optionBlocks
            .map((opt) => {
              const action = mapActionReverse(
                opt.action,
                stepBlocks,
                cardIds
              )
              if (!action) return null
              return { text: opt.label ?? '', action }
            })
            .filter(
              (o): o is { text: string; action: JourneySimpleAction } =>
                o != null
            )
          if (options.length >= 2) {
            content.push({
              type: 'poll',
              gridView: block.gridView === true,
              options
            } as JourneySimpleBlock)
          }
          break
        }

        case 'MultiselectBlock': {
          const optionBlocks = sortByParentOrder(
            journey.blocks.filter(
              (b) =>
                b.typename === 'MultiselectOptionBlock' &&
                b.parentBlockId === block.id
            )
          )
          const options = optionBlocks.map((opt) => opt.label ?? '')
          if (options.length >= 2) {
            content.push({
              type: 'multiselect',
              ...(block.min != null ? { min: block.min } : {}),
              ...(block.max != null ? { max: block.max } : {}),
              options
            })
          }
          break
        }

        case 'TextResponseBlock': {
          const inputTypeMap: Record<string, string> = {
            freeForm: 'freeForm',
            name: 'name',
            email: 'email',
            phone: 'phone'
          }
          content.push({
            type: 'textInput',
            label: block.label ?? '',
            ...(block.type && inputTypeMap[block.type]
              ? {
                  inputType: inputTypeMap[block.type] as
                    | 'freeForm'
                    | 'name'
                    | 'email'
                    | 'phone'
                }
              : {}),
            ...(block.placeholder ? { placeholder: block.placeholder } : {}),
            ...(block.hint ? { hint: block.hint } : {}),
            ...(block.required === true ? { required: true } : {})
          } as JourneySimpleBlock)
          break
        }

        case 'SpacerBlock': {
          if (block.spacing != null && block.spacing > 0) {
            content.push({
              type: 'spacer',
              spacing: block.spacing
            })
          }
          break
        }
      }
    }

    // Build card
    const card: JourneySimpleCard = {
      id: cardIds[index],
      ...(stepBlock.x != null ? { x: stepBlock.x } : {}),
      ...(stepBlock.y != null ? { y: stepBlock.y } : {}),
      ...(cardBlock.backgroundColor
        ? { backgroundColor: cardBlock.backgroundColor }
        : {}),
      content
    }

    // Background image (from cover block)
    if (cardBlock.coverBlockId) {
      const coverBlock = journey.blocks.find(
        (b) => b.id === cardBlock.coverBlockId
      )
      if (coverBlock?.typename === 'ImageBlock') {
        card.backgroundImage = {
          src: coverBlock.src ?? '',
          alt: coverBlock.alt ?? '',
          ...(coverBlock.width != null ? { width: coverBlock.width } : {}),
          ...(coverBlock.height != null
            ? { height: coverBlock.height }
            : {}),
          ...(coverBlock.blurhash ? { blurhash: coverBlock.blurhash } : {})
        }
      } else if (
        coverBlock?.typename === 'VideoBlock' &&
        coverBlock.source === 'youTube' &&
        coverBlock.videoId
      ) {
        card.backgroundVideo = {
          url: `https://youtube.com/watch?v=${coverBlock.videoId}`,
          ...(coverBlock.startAt != null
            ? { startAt: coverBlock.startAt }
            : {}),
          ...(coverBlock.endAt != null ? { endAt: coverBlock.endAt } : {})
        }
      }
    }

    // Default next card
    if (stepBlock.nextBlockId) {
      const nextIdx = stepBlocks.findIndex(
        (s) => s.id === stepBlock.nextBlockId
      )
      if (nextIdx >= 0) {
        card.defaultNextCard = cardIds[nextIdx]
      }
    }

    return card
  })

  return {
    title: journey.title,
    description: journey.description ?? '',
    cards
  }
}
