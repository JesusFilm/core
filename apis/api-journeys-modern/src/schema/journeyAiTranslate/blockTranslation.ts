/**
 * Block translation utilities
 * Provides helper functions for translation operations on journey blocks
 */

import { Block, PrismaClient } from '.prisma/api-journeys-modern-client'

/**
 * Interface for translation updates for a block
 */
export interface BlockTranslationUpdate {
  blockId: string
  updates: Partial<Block>
}

/**
 * Interface for AI translation updates for a block
 * Used in AI translation process
 */
export interface AIBlockTranslationUpdate {
  blockId: string
  updates: Record<string, string>
}

/**
 * Maps blocks that contain translatable fields
 */
export function getTranslatableFields(
  block: Block
): Record<string, string | null | undefined> {
  if (block.typename === 'TypographyBlock') {
    return {
      content: block.content
    }
  }

  if (block.typename === 'ButtonBlock') {
    return {
      label: block.label
    }
  }

  if (block.typename === 'TextResponseBlock') {
    return {
      label: block.label,
      placeholder: block.placeholder
    }
  }

  if (block.typename === 'RadioOptionBlock') {
    return {
      label: block.label
    }
  }

  return {}
}

/**
 * Creates translation info string for a block
 */
export function createTranslationInfo(block: Block): string {
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
