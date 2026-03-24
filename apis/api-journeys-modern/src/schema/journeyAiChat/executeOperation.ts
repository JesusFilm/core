import { TextResponseType } from '@core/prisma/journeys/client'
import { prisma } from '@core/prisma/journeys/client'
import type { PlanOperation } from '@core/shared/ai/agentJourneyTypes'
import type { JourneySimpleAction } from '@core/shared/ai/journeySimpleTypes'

import { processImage, updateSimpleJourney } from '../journey/simple/updateSimpleJourney'

/** Sanitize error messages — strip Prisma internals, connection strings, stack traces */
export function sanitizeErrorMessage(message: string): string {
  // Remove Prisma-specific prefixes
  const cleaned = message
    .replace(/Invalid `prisma\.\w+\.\w+\([^)]*\)` invocation[\s\S]*$/, '')
    .replace(/\n\s+at\s+.*$/gm, '') // stack traces
    .replace(/prisma:\w+/g, '[internal]') // connection strings
    .replace(/`\w+`\.`\w+`/g, '[table]') // table references
    .trim()
  return cleaned || 'An unexpected error occurred.'
}

/** Validate that a block exists and belongs to the journey */
async function validateBlock(
  blockId: string,
  journeyId: string
): Promise<void> {
  const block = await prisma.block.findFirst({
    where: { id: blockId, journeyId, deletedAt: null }
  })
  if (!block) {
    throw new Error(`Block not found or does not belong to this journey.`)
  }
}

/**
 * Map from simpleId → real stepBlockId, populated by createCard during plan execution.
 * This allows later operations in the same plan to reference cards created earlier.
 */
const cardIdMap = new Map<string, string>()

/** Resolve a cardId to a valid step block ID — handles real IDs, simpleIds, and plan-created cards */
async function resolveCardId(
  cardId: string,
  journeyId: string
): Promise<string | null> {
  // Check the plan-local map first (cards created earlier in this plan)
  const mapped = cardIdMap.get(cardId)
  if (mapped != null) return mapped

  // Check if it's a real block ID
  const block = await prisma.block.findFirst({
    where: { id: cardId, journeyId, typename: 'StepBlock', deletedAt: null },
    select: { id: true }
  })
  if (block != null) return block.id

  return null
}

/** Map a JourneySimpleAction to Prisma action create/upsert input */
async function mapActionToPrisma(
  action: JourneySimpleAction,
  journeyId: string
): Promise<Record<string, unknown> | undefined> {
  switch (action.kind) {
    case 'navigate': {
      const resolvedId = await resolveCardId(action.cardId, journeyId)
      if (resolvedId == null) return undefined
      return { upsert: { create: { blockId: resolvedId }, update: { blockId: resolvedId } } }
    }
    case 'url':
      return { upsert: { create: { url: action.url }, update: { url: action.url } } }
    case 'email':
      return { upsert: { create: { email: action.email }, update: { email: action.email } } }
    case 'chat':
      return { upsert: { create: { chatUrl: action.chatUrl }, update: { chatUrl: action.chatUrl } } }
    case 'phone':
      return {
        upsert: {
          create: {
            phone: action.phone,
            ...(action.countryCode ? { countryCode: action.countryCode } : {}),
            ...(action.contactAction
              ? { contactAction: action.contactAction }
              : {})
          },
          update: {
            phone: action.phone,
            ...(action.countryCode ? { countryCode: action.countryCode } : {}),
            ...(action.contactAction
              ? { contactAction: action.contactAction }
              : {})
          }
        }
      }
  }
}

// --- Surgical tool implementations ---

async function createCard(
  journeyId: string,
  args: { card: unknown; insertAfterCard?: string }
): Promise<void> {
  const card = args.card as {
    id?: string
    backgroundColor?: string
    backgroundImage?: { src: string; alt: string }
    content?: Array<Record<string, unknown>>
    defaultNextCard?: string
  }

  // Get current step blocks to determine order
  const steps = await prisma.block.findMany({
    where: { journeyId, typename: 'StepBlock', deletedAt: null },
    orderBy: { parentOrder: 'asc' }
  })

  let insertIndex = steps.length // default: append at end

  if (args.insertAfterCard) {
    const afterIdx = steps.findIndex((s) => s.id === args.insertAfterCard)
    if (afterIdx >= 0) insertIndex = afterIdx + 1
  }

  // Shift subsequent steps
  for (let i = insertIndex; i < steps.length; i++) {
    await prisma.block.update({
      where: { id: steps[i].id },
      data: { parentOrder: i + 1 }
    })
  }

  // Create StepBlock
  const stepBlock = await prisma.block.create({
    data: {
      journeyId,
      typename: 'StepBlock',
      parentOrder: insertIndex,
      x: insertIndex * 300,
      y: 0,
      nextBlockId: card.defaultNextCard
        ? (await resolveCardId(card.defaultNextCard, journeyId) ?? null)
        : null
    }
  })

  // Register simpleId → real ID so later operations can reference this card
  if (card.id != null) {
    cardIdMap.set(card.id, stepBlock.id)
  }

  // Create CardBlock
  const cardBlock = await prisma.block.create({
    data: {
      journeyId,
      typename: 'CardBlock',
      parentBlockId: stepBlock.id,
      parentOrder: 0,
      backgroundColor: card.backgroundColor ?? null
    }
  })

  // Create content blocks from card spec
  if (card.content != null) {
    for (const [blockIndex, block] of card.content.entries()) {
      await addBlock(journeyId, {
        cardBlockId: cardBlock.id,
        block,
        position: blockIndex
      })
    }
  }

  // Background image
  if (card.backgroundImage != null) {
    const processed = await processImage({
      src: card.backgroundImage.src,
      alt: card.backgroundImage.alt
    })
    const imageBlock = await prisma.block.create({
      data: {
        journeyId,
        typename: 'ImageBlock',
        parentBlockId: cardBlock.id,
        parentOrder: null,
        src: processed.src,
        alt: processed.alt,
        width: processed.width,
        height: processed.height,
        blurhash: processed.blurhash
      }
    })
    await prisma.block.update({
      where: { id: cardBlock.id },
      data: { coverBlockId: imageBlock.id }
    })
  }

  // Rewire navigation if inserting in the middle
  if (args.insertAfterCard && insertIndex > 0 && insertIndex < steps.length) {
    const prevStep = steps[insertIndex - 1]
    const nextStep = steps[insertIndex] // the one that shifted

    await prisma.block.update({
      where: { id: prevStep.id },
      data: { nextBlockId: stepBlock.id }
    })

    await prisma.block.update({
      where: { id: stepBlock.id },
      data: { nextBlockId: nextStep.id }
    })
  }
}

async function deleteCard(
  journeyId: string,
  args: { cardId: string; redirectTo?: string }
): Promise<void> {
  await validateBlock(args.cardId, journeyId)

  // Determine redirect target: explicit > nextBlockId > next card by order
  const deletedStep = await prisma.block.findFirst({
    where: { id: args.cardId, journeyId, deletedAt: null },
    select: { nextBlockId: true, parentOrder: true }
  })

  let redirectTo: string | null = args.redirectTo ?? deletedStep?.nextBlockId ?? null

  // If no nextBlockId, find the next card by parentOrder
  if (redirectTo == null && deletedStep?.parentOrder != null) {
    const nextStep = await prisma.block.findFirst({
      where: {
        journeyId,
        typename: 'StepBlock',
        deletedAt: null,
        id: { not: args.cardId },
        parentOrder: { gt: deletedStep.parentOrder }
      },
      orderBy: { parentOrder: 'asc' },
      select: { id: true }
    })
    redirectTo = nextStep?.id ?? null
  }

  // If still no target, try the previous card
  if (redirectTo == null && deletedStep?.parentOrder != null) {
    const prevStep = await prisma.block.findFirst({
      where: {
        journeyId,
        typename: 'StepBlock',
        deletedAt: null,
        id: { not: args.cardId },
        parentOrder: { lt: deletedStep.parentOrder }
      },
      orderBy: { parentOrder: 'desc' },
      select: { id: true }
    })
    redirectTo = prevStep?.id ?? null
  }

  const now = new Date().toISOString()

  // Find the card block
  const cardBlock = await prisma.block.findFirst({
    where: {
      journeyId,
      parentBlockId: args.cardId,
      typename: 'CardBlock',
      deletedAt: null
    }
  })

  // Soft-delete step + card + all children
  await prisma.block.updateMany({
    where: {
      journeyId,
      deletedAt: null,
      OR: [
        { id: args.cardId },
        { parentBlockId: args.cardId },
        ...(cardBlock
          ? [{ parentBlockId: cardBlock.id }]
          : [])
      ]
    },
    data: { deletedAt: now }
  })

  // Rewire navigation — always rewire to prevent broken links
  if (redirectTo != null) {
    // Rewire actions that navigate to the deleted card
    await prisma.action.updateMany({
      where: { blockId: args.cardId },
      data: { blockId: redirectTo }
    })

    // Rewire steps that had nextBlockId pointing to deleted step
    await prisma.block.updateMany({
      where: { journeyId, nextBlockId: args.cardId, deletedAt: null },
      data: { nextBlockId: redirectTo }
    })
  } else {
    // No redirect target — just clear the dangling references
    await prisma.action.updateMany({
      where: { blockId: args.cardId },
      data: { blockId: null }
    })

    await prisma.block.updateMany({
      where: { journeyId, nextBlockId: args.cardId, deletedAt: null },
      data: { nextBlockId: null }
    })
  }
}

async function updateCard(
  journeyId: string,
  args: {
    blockId: string
    backgroundColor?: string
    backgroundImage?: { src: string; alt: string } | null
    defaultNextCard?: string
    x?: number
    y?: number
  }
): Promise<void> {
  await validateBlock(args.blockId, journeyId)

  // Update StepBlock (position, nextBlockId)
  const stepUpdate: Record<string, unknown> = {}
  if (args.x !== undefined) stepUpdate.x = args.x
  if (args.y !== undefined) stepUpdate.y = args.y
  if (args.defaultNextCard !== undefined) {
    if (args.defaultNextCard === null || args.defaultNextCard === '') {
      stepUpdate.nextBlockId = null
    } else {
      // Validate the target block exists before setting FK
      const targetBlock = await prisma.block.findFirst({
        where: { id: args.defaultNextCard, journeyId, deletedAt: null }
      })
      if (targetBlock != null) {
        stepUpdate.nextBlockId = args.defaultNextCard
      }
    }
  }

  if (Object.keys(stepUpdate).length > 0) {
    await prisma.block.update({
      where: { id: args.blockId },
      data: stepUpdate
    })
  }

  const cardBlock = await prisma.block.findFirst({
    where: {
      journeyId,
      parentBlockId: args.blockId,
      typename: 'CardBlock',
      deletedAt: null
    }
  })
  if (cardBlock == null) return

  // Update CardBlock (backgroundColor)
  if (args.backgroundColor !== undefined) {
    await prisma.block.update({
      where: { id: cardBlock.id },
      data: { backgroundColor: args.backgroundColor }
    })
  }

  // Update, create, or remove background image (cover block)
  if (args.backgroundImage !== undefined) {
    if (args.backgroundImage === null) {
      // Remove background image
      if (cardBlock.coverBlockId != null) {
        await prisma.block.updateMany({
          where: { id: cardBlock.coverBlockId, journeyId, deletedAt: null },
          data: { deletedAt: new Date().toISOString() }
        })
        await prisma.block.update({
          where: { id: cardBlock.id },
          data: { coverBlockId: null }
        })
      }
    } else {
      // Set or update background image
      const processed = await processImage({
        src: args.backgroundImage.src,
        alt: args.backgroundImage.alt
      })

      const existingCover =
        cardBlock.coverBlockId != null
          ? await prisma.block.findFirst({
              where: {
                id: cardBlock.coverBlockId,
                journeyId,
                typename: 'ImageBlock',
                deletedAt: null
              }
            })
          : null

      if (existingCover != null) {
        await prisma.block.update({
          where: { id: existingCover.id },
          data: {
            src: processed.src,
            alt: processed.alt,
            width: processed.width,
            height: processed.height,
            blurhash: processed.blurhash
          }
        })
      } else {
        const imageBlock = await prisma.block.create({
          data: {
            journeyId,
            typename: 'ImageBlock',
            parentBlockId: cardBlock.id,
            parentOrder: null,
            src: processed.src,
            alt: processed.alt,
            width: processed.width,
            height: processed.height,
            blurhash: processed.blurhash
          }
        })
        await prisma.block.update({
          where: { id: cardBlock.id },
          data: { coverBlockId: imageBlock.id }
        })
      }
    }
  }
}

async function addBlock(
  journeyId: string,
  args: { cardBlockId: string; block: unknown; position?: number }
): Promise<void> {
  await validateBlock(args.cardBlockId, journeyId)

  const block = args.block as Record<string, unknown>
  const type = block.type as string

  // Get current children to determine parentOrder
  const siblings = await prisma.block.findMany({
    where: {
      journeyId,
      parentBlockId: args.cardBlockId,
      deletedAt: null
    },
    orderBy: { parentOrder: 'asc' }
  })

  const position = args.position ?? siblings.length

  // Shift subsequent siblings
  for (let i = position; i < siblings.length; i++) {
    await prisma.block.update({
      where: { id: siblings[i].id },
      data: { parentOrder: i + 1 }
    })
  }

  // Create the block based on type
  switch (type) {
    case 'heading':
    case 'text':
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'TypographyBlock',
          parentBlockId: args.cardBlockId,
          parentOrder: position,
          content: block.text as string,
          variant: (block.variant as string) ?? (type === 'heading' ? 'h3' : 'body1')
        }
      })
      break

    case 'button': {
      const action = block.action as JourneySimpleAction | undefined
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'ButtonBlock',
          parentBlockId: args.cardBlockId,
          parentOrder: position,
          label: block.text as string,
          ...(action ? { action: await mapActionToPrisma(action, journeyId) } : {})
        }
      })
      break
    }

    case 'image':
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'ImageBlock',
          parentBlockId: args.cardBlockId,
          parentOrder: position,
          src: block.src as string,
          alt: block.alt as string,
          width: (block.width as number) ?? 1,
          height: (block.height as number) ?? 1,
          blurhash: (block.blurhash as string) ?? ''
        }
      })
      break

    case 'textInput':
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'TextResponseBlock',
          parentBlockId: args.cardBlockId,
          parentOrder: position,
          label: block.label as string,
          type: ((block.inputType as string) ?? 'freeForm') as TextResponseType,
          ...(block.placeholder ? { placeholder: block.placeholder as string } : {}),
          ...(block.hint ? { hint: block.hint as string } : {}),
          ...(block.required === true ? { required: true } : {})
        }
      })
      break

    case 'spacer':
      await prisma.block.create({
        data: {
          journeyId,
          typename: 'SpacerBlock',
          parentBlockId: args.cardBlockId,
          parentOrder: position,
          spacing: block.spacing as number
        }
      })
      break

    case 'poll': {
      const pollBlock = await prisma.block.create({
        data: {
          journeyId,
          typename: 'RadioQuestionBlock',
          parentBlockId: args.cardBlockId,
          parentOrder: position
        }
      })
      const options = (block.options as Array<{ text: string; action: JourneySimpleAction }>) ?? []
      for (const [j, option] of options.entries()) {
        await prisma.block.create({
          data: {
            journeyId,
            typename: 'RadioOptionBlock',
            parentBlockId: pollBlock.id,
            parentOrder: j,
            label: option.text,
            ...(option.action ? { action: await mapActionToPrisma(option.action, journeyId) } : {})
          }
        })
      }
      break
    }

    case 'multiselect': {
      const msBlock = await prisma.block.create({
        data: {
          journeyId,
          typename: 'MultiselectBlock',
          parentBlockId: args.cardBlockId,
          parentOrder: position
        }
      })
      const opts = (block.options as string[]) ?? []
      for (const [j, optText] of opts.entries()) {
        await prisma.block.create({
          data: {
            journeyId,
            typename: 'MultiselectOptionBlock',
            parentBlockId: msBlock.id,
            parentOrder: j,
            label: optText
          }
        })
      }
      break
    }
  }
}

async function updateBlock(
  journeyId: string,
  args: { blockId: string; updates: Record<string, unknown> }
): Promise<void> {
  await validateBlock(args.blockId, journeyId)

  const block = await prisma.block.findFirst({
    where: { id: args.blockId, journeyId, deletedAt: null }
  })
  if (!block) throw new Error('Block not found.')

  const data: Record<string, unknown> = {}

  switch (block.typename) {
    case 'TypographyBlock':
      if (args.updates.text !== undefined) data.content = args.updates.text
      if (args.updates.variant !== undefined) data.variant = args.updates.variant
      break
    case 'ButtonBlock':
      if (args.updates.text !== undefined) data.label = args.updates.text
      if (args.updates.action !== undefined) {
        const actionData = await mapActionToPrisma(
          args.updates.action as JourneySimpleAction,
          journeyId
        )
        if (actionData != null) data.action = actionData
      }
      break
    case 'RadioOptionBlock':
      if (args.updates.text !== undefined) data.label = args.updates.text
      if (args.updates.action !== undefined) {
        const actionData = await mapActionToPrisma(
          args.updates.action as JourneySimpleAction,
          journeyId
        )
        if (actionData != null) data.action = actionData
      }
      break
    case 'ImageBlock':
      if (args.updates.src !== undefined) data.src = args.updates.src
      if (args.updates.alt !== undefined) data.alt = args.updates.alt
      break
    case 'TextResponseBlock':
      if (args.updates.label !== undefined) data.label = args.updates.label
      if (args.updates.placeholder !== undefined)
        data.placeholder = args.updates.placeholder
      if (args.updates.hint !== undefined) data.hint = args.updates.hint
      if (args.updates.inputType !== undefined)
        data.type = args.updates.inputType
      break
    case 'SpacerBlock':
      if (args.updates.spacing !== undefined) data.spacing = args.updates.spacing
      break
  }

  if (Object.keys(data).length > 0) {
    await prisma.block.update({
      where: { id: args.blockId },
      data
    })
  }
}

async function deleteBlock(
  journeyId: string,
  args: { blockId: string }
): Promise<void> {
  await validateBlock(args.blockId, journeyId)

  const block = await prisma.block.findFirst({
    where: { id: args.blockId, journeyId, deletedAt: null }
  })
  if (!block) throw new Error('Block not found.')

  const now = new Date().toISOString()

  // Soft-delete the block and its children (for compound blocks like poll)
  await prisma.block.updateMany({
    where: {
      journeyId,
      deletedAt: null,
      OR: [{ id: args.blockId }, { parentBlockId: args.blockId }]
    },
    data: { deletedAt: now }
  })

  // Shift siblings
  if (block.parentBlockId && block.parentOrder != null) {
    await prisma.block.updateMany({
      where: {
        journeyId,
        parentBlockId: block.parentBlockId,
        parentOrder: { gt: block.parentOrder },
        deletedAt: null
      },
      data: { parentOrder: { decrement: 1 } }
    })
  }
}

async function reorderCards(
  journeyId: string,
  args: { blockIds: string[] }
): Promise<void> {
  for (const [i, blockId] of args.blockIds.entries()) {
    await prisma.block.update({
      where: { id: blockId },
      data: { parentOrder: i, x: i * 300 }
    })
  }
}

async function updateJourneySettings(
  journeyId: string,
  args: { title?: string; description?: string }
): Promise<void> {
  const data: Record<string, unknown> = {}
  if (args.title !== undefined) data.title = args.title
  if (args.description !== undefined) data.description = args.description

  if (Object.keys(data).length > 0) {
    await prisma.journey.update({
      where: { id: journeyId },
      data
    })
  }
}

// --- Plan lifecycle ---

/** Seed the card ID map with existing journey card simpleId→blockId mappings */
export function seedCardIdMap(
  mappings: Array<{ simpleId: string; blockId: string }>
): void {
  cardIdMap.clear()
  for (const { simpleId, blockId } of mappings) {
    cardIdMap.set(simpleId, blockId)
  }
}

/** Clear the card ID map between plan executions */
export function clearCardIdMap(): void {
  cardIdMap.clear()
}

// --- Main executor ---

export async function executeOperation(
  op: PlanOperation,
  journeyId: string
): Promise<void> {
  switch (op.tool) {
    case 'generate_journey': {
      const simple = op.args.simple
      if (simple?.cards == null) {
        throw new Error(
          'generate_journey requires args.simple with title, description, and cards'
        )
      }
      return updateSimpleJourney(journeyId, simple)
    }
    case 'create_card':
      return createCard(journeyId, op.args as any)
    case 'delete_card':
      return deleteCard(journeyId, op.args)
    case 'update_card':
      return updateCard(journeyId, op.args)
    case 'add_block':
      return addBlock(journeyId, op.args as any)
    case 'update_block':
      return updateBlock(journeyId, op.args)
    case 'delete_block':
      return deleteBlock(journeyId, op.args)
    case 'reorder_cards':
      return reorderCards(journeyId, op.args)
    case 'update_journey_settings':
      return updateJourneySettings(journeyId, op.args)
    case 'translate':
      // Delegate to existing translate subscription (Phase 3)
      throw new Error('Translation via AI chat is not yet implemented.')
  }
}
