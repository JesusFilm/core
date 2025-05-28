/**
 * Block translation utilities
 * Provides helper functions for translation operations on journey blocks
 */

import { Block, PrismaClient } from '.prisma/api-journeys-modern-client'

import {
  AnyBlock,
  BlockTranslationUpdate,
  isButtonBlock,
  isRadioOptionBlock,
  isRadioQuestionBlock,
  isTextResponseBlock,
  isTypographyBlock
} from '../types/block'

/**
 * Converts a Prisma Block to a typed AnyBlock
 */
export function castBlock(block: Block): AnyBlock {
  return block as unknown as AnyBlock
}

/**
 * Maps blocks that contain translatable fields
 */
export function getTranslatableFields(
  block: AnyBlock
): Record<string, string | null | undefined> {
  if (isTypographyBlock(block)) {
    return {
      content: block.content
    }
  }

  if (isButtonBlock(block)) {
    return {
      label: block.label
    }
  }

  if (isTextResponseBlock(block)) {
    return {
      label: block.label,
      placeholder: block.placeholder
    }
  }

  if (isRadioOptionBlock(block)) {
    return {
      label: block.label
    }
  }

  if (isRadioQuestionBlock(block)) {
    return {
      label: block.label
    }
  }

  return {}
}

/**
 * Creates translation info string for a block
 */
export function createTranslationInfo(block: AnyBlock): string {
  const fieldInfo = []
  const translateableFields = getTranslatableFields(block)

  for (const [field, value] of Object.entries(translateableFields)) {
    if (value !== undefined && value !== null) {
      fieldInfo.push(`${field}: "${value}"`)
    }
  }

  return `[${block.id}] ${block.typename}: ${fieldInfo.join(', ')}`
}

/**
 * Updates a block with translated content
 */
export async function updateBlockWithTranslation(
  prisma: PrismaClient,
  journeyId: string,
  translationUpdate: BlockTranslationUpdate
): Promise<void> {
  const { blockId, updates } = translationUpdate
  const blockIdClean = blockId.replace(/^\[|\]$/g, '')

  // Only update fields that have values
  const filteredUpdates: Record<string, string> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null) {
      filteredUpdates[key] = value as string
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return
  }

  await prisma.block.update({
    where: {
      id: blockIdClean,
      journeyId
    },
    data: filteredUpdates
  })
}
