/**
 * Block translation utilities
 * Provides helper functions for translation operations on journey blocks
 */

import { PrismaClient } from '.prisma/api-journeys-modern-client'

import { Block } from '../block/block'
import { ButtonBlock } from '../block/button/button'
import { CardBlock } from '../block/card/card'
import { GridContainerBlock } from '../block/gridContainer/gridContainer'
import { GridItemBlock } from '../block/gridItem/gridItem'
import { IconBlock } from '../block/icon/icon'
import { ImageBlock } from '../block/image/image'
import { RadioOptionBlock } from '../block/radioOption/radioOption'
import { RadioQuestionBlock } from '../block/radioQuestion/radioQuestion'
import { SpacerBlock } from '../block/spacer/spacer'
import { StepBlock } from '../block/step/step'
import { TextResponseBlock } from '../block/textResponse/textResponse'
import { TypographyBlock } from '../block/typography/typography'
import { VideoBlock } from '../block/video/video'

export type Block = typeof Block.$inferType

/**
 * Type union for all translatable block types
 */
export type TranslatableBlock =
  | typeof TypographyBlock.$inferType
  | typeof ButtonBlock.$inferType
  | typeof TextResponseBlock.$inferType
  | typeof RadioOptionBlock.$inferType

/**
 * Type union for all block types
 */
export type AnyBlock =
  | TranslatableBlock
  | typeof CardBlock.$inferType
  | typeof RadioQuestionBlock.$inferType
  | typeof StepBlock.$inferType
  | typeof ImageBlock.$inferType
  | typeof VideoBlock.$inferType
  | typeof SpacerBlock.$inferType
  | typeof GridContainerBlock.$inferType
  | typeof GridItemBlock.$inferType
  | typeof IconBlock.$inferType

/**
 * Interface for translation updates for a block
 */
export interface BlockTranslationUpdate {
  blockId: string
  updates: Partial<TranslatableBlock>
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
