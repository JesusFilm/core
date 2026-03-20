import type { Prisma } from '@core/prisma/journeys/client'
import { prisma } from '@core/prisma/journeys/client'
import type {
  AgentJourney,
  AgentJourneyCard,
  NavigationMapEntry
} from '@core/shared/ai/agentJourneyTypes'
import type { JourneySimpleBlock } from '@core/shared/ai/journeySimpleTypes'

type Block = Prisma.JourneyGetPayload<{
  include: { blocks: { include: { action: true } } }
}>['blocks'][number]

type StepBlock = Block & { typename: 'StepBlock' }

/** Sort blocks by parentOrder (null -> Infinity) */
function sortByParentOrder(blocks: Block[]): Block[] {
  return [...blocks].sort(
    (a, b) => (a.parentOrder ?? Infinity) - (b.parentOrder ?? Infinity)
  )
}

/** Generate content-derived card IDs from heading/text content */
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

/** Resolve a navigate action blockId to a card simpleId */
function resolveNavigateCardId(
  targetBlockId: string | null,
  stepBlocks: StepBlock[],
  cardIds: string[]
): string | undefined {
  if (targetBlockId == null) return undefined
  const idx = stepBlocks.findIndex((s) => s.id === targetBlockId)
  if (idx < 0) return undefined
  return cardIds[idx]
}

/** Map a block's children to JourneySimpleBlock items with blockId */
function mapContentBlocks(
  childBlocks: Block[],
  cardBlock: Block,
  allBlocks: Block[],
  stepBlocks: StepBlock[],
  cardIds: string[]
): Array<JourneySimpleBlock & { blockId: string }> {
  const content: Array<JourneySimpleBlock & { blockId: string }> = []

  for (const block of childBlocks) {
    if (block.id === cardBlock.coverBlockId) continue

    switch (block.typename) {
      case 'TypographyBlock': {
        const variant = block.variant ?? 'body1'
        const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
          variant
        )
        if (isHeading) {
          content.push({
            blockId: block.id,
            type: 'heading',
            text: block.content ?? '',
            variant: variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
          })
        } else {
          content.push({
            blockId: block.id,
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
        const action = mapAction(block.action, stepBlocks, cardIds)
        if (action) {
          content.push({
            blockId: block.id,
            type: 'button',
            text: block.label ?? '',
            action
          })
        }
        break
      }

      case 'ImageBlock': {
        content.push({
          blockId: block.id,
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
            blockId: block.id,
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
          allBlocks.filter(
            (b) =>
              b.typename === 'RadioOptionBlock' &&
              b.parentBlockId === block.id
          )
        )
        const options = optionBlocks.map((opt) => {
          const action = mapAction(opt.action, stepBlocks, cardIds)
          return {
            text: opt.label ?? '',
            blockId: opt.id,
            ...(action != null ? { action } : {})
          }
        })
        if (options.length >= 2) {
          content.push({
            blockId: block.id,
            type: 'poll',
            gridView: block.gridView === true,
            options
          } as JourneySimpleBlock & { blockId: string })
        }
        break
      }

      case 'MultiselectBlock': {
        const optionBlocks = sortByParentOrder(
          allBlocks.filter(
            (b) =>
              b.typename === 'MultiselectOptionBlock' &&
              b.parentBlockId === block.id
          )
        )
        const options = optionBlocks.map((opt) => opt.label ?? '')
        if (options.length >= 2) {
          content.push({
            blockId: block.id,
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
          blockId: block.id,
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
        } as JourneySimpleBlock & { blockId: string })
        break
      }

      case 'SpacerBlock': {
        if (block.spacing != null && block.spacing > 0) {
          content.push({
            blockId: block.id,
            type: 'spacer',
            spacing: block.spacing
          })
        }
        break
      }
    }
  }

  return content
}

/** Map a Prisma Action to a JourneySimpleAction */
function mapAction(
  action: Block['action'],
  stepBlocks: StepBlock[],
  cardIds: string[]
):
  | {
      kind: 'navigate'
      cardId: string
    }
  | { kind: 'url'; url: string }
  | { kind: 'email'; email: string }
  | { kind: 'chat'; chatUrl: string }
  | {
      kind: 'phone'
      phone: string
      countryCode?: string
      contactAction?: 'call' | 'text'
    }
  | undefined {
  if (!action) return undefined
  if (action.blockId) {
    const idx = stepBlocks.findIndex((s) => s.id === action.blockId)
    if (idx >= 0) return { kind: 'navigate', cardId: cardIds[idx] }
  }
  if (action.url) return { kind: 'url', url: action.url }
  if (action.email) return { kind: 'email', email: action.email }
  if ((action as Record<string, unknown>).chatUrl)
    return {
      kind: 'chat',
      chatUrl: (action as Record<string, unknown>).chatUrl as string
    }
  if (action.phone) {
    return {
      kind: 'phone',
      phone: action.phone,
      ...(action.countryCode ? { countryCode: action.countryCode } : {}),
      ...(action.contactAction === 'call' || action.contactAction === 'text'
        ? { contactAction: action.contactAction }
        : {})
    }
  }
  return undefined
}

/** Read a journey from Prisma and map it to AgentJourney for the AI system prompt */
export async function getAgentJourney(
  journeyId: string,
  languageName?: string | null
): Promise<AgentJourney> {
  const journey = await prisma.journey.findUniqueOrThrow({
    where: { id: journeyId },
    include: {
      blocks: {
        where: { deletedAt: null },
        include: { action: true }
      }
    }
  })

  const stepBlocks = journey.blocks.filter(
    (block): block is StepBlock => block.typename === 'StepBlock'
  )

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

  const navigationMap: NavigationMapEntry[] = []

  const cards: AgentJourneyCard[] = stepBlocks.map((stepBlock, index) => {
    const cardBlock = journey.blocks.find(
      (b) => b.parentBlockId === stepBlock.id
    )
    if (!cardBlock) throw new Error('Card block not found')

    const childBlocks = sortByParentOrder(
      journey.blocks.filter((b) => b.parentBlockId === cardBlock.id)
    )

    const content = mapContentBlocks(
      childBlocks,
      cardBlock,
      journey.blocks,
      stepBlocks,
      cardIds
    )

    const card: AgentJourneyCard = {
      simpleId: cardIds[index],
      blockId: stepBlock.id,
      cardBlockId: cardBlock.id,
      content,
      ...(cardBlock.backgroundColor
        ? { backgroundColor: cardBlock.backgroundColor }
        : {})
    }

    // Heading
    const headingItem = content.find((c) => c.type === 'heading')
    if (headingItem && 'text' in headingItem) {
      card.heading = headingItem.text
    }

    // Background image from cover block
    if (cardBlock.coverBlockId) {
      const coverBlock = journey.blocks.find(
        (b) => b.id === cardBlock.coverBlockId
      )
      if (coverBlock?.typename === 'ImageBlock') {
        card.backgroundImage = {
          src: coverBlock.src ?? '',
          alt: coverBlock.alt ?? ''
        }
      } else if (
        coverBlock?.typename === 'VideoBlock' &&
        coverBlock.source === 'youTube' &&
        coverBlock.videoId
      ) {
        card.backgroundVideo = {
          url: `https://youtube.com/watch?v=${coverBlock.videoId}`
        }
      }
    }

    // Default next card
    const defaultNextCardId = resolveNavigateCardId(
      stepBlock.nextBlockId,
      stepBlocks,
      cardIds
    )
    if (defaultNextCardId != null) {
      card.defaultNextCard = defaultNextCardId
      navigationMap.push({
        sourceCardId: cardIds[index],
        targetCardId: defaultNextCardId,
        trigger: 'default',
        blockId: stepBlock.id
      })
    }

    // Button navigate actions
    for (const item of content) {
      if (item.type === 'button' && 'action' in item) {
        const action = item.action as { kind: string; cardId?: string }
        if (action.kind === 'navigate' && action.cardId) {
          navigationMap.push({
            sourceCardId: cardIds[index],
            targetCardId: action.cardId,
            trigger: 'button',
            label: 'text' in item ? (item.text as string) : undefined,
            blockId: item.blockId
          })
        }
      }
    }

    // Poll (RadioOption) navigate actions
    for (const block of childBlocks) {
      if (block.typename !== 'RadioQuestionBlock') continue
      const optionBlocks = sortByParentOrder(
        journey.blocks.filter(
          (b) =>
            b.typename === 'RadioOptionBlock' &&
            b.parentBlockId === block.id
        )
      )
      for (const opt of optionBlocks) {
        if (!opt.action?.blockId) continue
        const targetCardId = resolveNavigateCardId(
          opt.action.blockId,
          stepBlocks,
          cardIds
        )
        if (targetCardId == null) continue
        navigationMap.push({
          sourceCardId: cardIds[index],
          targetCardId,
          trigger: 'poll',
          label: opt.label ?? undefined,
          blockId: opt.id
        })
      }
    }

    return card
  })

  return {
    title: journey.title,
    description: journey.description ?? '',
    language: languageName ?? 'English',
    cards,
    navigationMap
  }
}
