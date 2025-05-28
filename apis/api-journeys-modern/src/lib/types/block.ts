/**
 * Shared block interfaces and types for API Journeys
 * These types are used for sharing block data between services, especially for translation
 */

import {
  TextResponseType,
  VideoBlockSource
} from '.prisma/api-journeys-modern-client'

/**
 * Base Block interface that all block types extend
 */
export interface Block {
  id: string
  typename: string
  journeyId: string
  parentBlockId?: string | null
  parentOrder?: number | null
}

/**
 * Block with translatable content field
 */
export interface TypographyBlock extends Block {
  typename: 'TypographyBlock'
  content?: string | null
  variant?: string | null
  color?: string | null
  align?: string | null
}

/**
 * Block with translatable label field
 */
export interface ButtonBlock extends Block {
  typename: 'ButtonBlock'
  label?: string | null
  variant?: string | null
  color?: string | null
  size?: string | null
  startIconId?: string | null
  endIconId?: string | null
}

/**
 * Block with translatable label and placeholder fields
 */
export interface TextResponseBlock extends Block {
  typename: 'TextResponseBlock'
  label?: string | null
  placeholder?: string | null
  required?: boolean | null
  hint?: string | null
  minRows?: number | null
  type?: TextResponseType | null
  routeId?: string | null
  integrationId?: string | null
}

/**
 * Block with translatable label field
 */
export interface RadioOptionBlock extends Block {
  typename: 'RadioOptionBlock'
  label?: string | null
}

/**
 * Block with translatable label field
 */
export interface RadioQuestionBlock extends Block {
  typename: 'RadioQuestionBlock'
  label?: string | null
}

/**
 * Card Block container
 */
export interface CardBlock extends Block {
  typename: 'CardBlock'
  coverBlockId?: string | null
  backgroundColor?: string | null
  fullscreen?: boolean | null
  themeMode?: string | null
  themeName?: string | null
}

/**
 * Step Block container
 */
export interface StepBlock extends Block {
  typename: 'StepBlock'
  nextBlockId?: string | null
  locked?: boolean | null
  x?: number | null
  y?: number | null
  slug?: string | null
}

/**
 * Image Block
 */
export interface ImageBlock extends Block {
  typename: 'ImageBlock'
  src?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  blurhash?: string | null
  focalTop?: number | null
  focalLeft?: number | null
  scale?: number | null
}

/**
 * Video Block
 */
export interface VideoBlock extends Block {
  typename: 'VideoBlock'
  source?: VideoBlockSource | null
  videoId?: string | null
  videoVariantLanguageId?: string | null
  startAt?: number | null
  endAt?: number | null
  muted?: boolean | null
  autoplay?: boolean | null
  posterBlockId?: string | null
  fullsize?: boolean | null
  objectFit?: string | null
  title?: string | null
  description?: string | null
}

/**
 * Spacer Block
 */
export interface SpacerBlock extends Block {
  typename: 'SpacerBlock'
  spacing?: number | null
}

/**
 * Grid Container Block
 */
export interface GridContainerBlock extends Block {
  typename: 'GridContainerBlock'
  gap?: number | null
  direction?: string | null
  justifyContent?: string | null
  alignItems?: string | null
}

/**
 * Grid Item Block
 */
export interface GridItemBlock extends Block {
  typename: 'GridItemBlock'
  xl?: number | null
  lg?: number | null
  sm?: number | null
}

/**
 * Icon Block
 */
export interface IconBlock extends Block {
  typename: 'IconBlock'
  name?: string | null
  color?: string | null
  size?: string | null
}

/**
 * Type guard to check if a block is a TypographyBlock
 */
export function isTypographyBlock(block: Block): block is TypographyBlock {
  return block.typename === 'TypographyBlock'
}

/**
 * Type guard to check if a block is a ButtonBlock
 */
export function isButtonBlock(block: Block): block is ButtonBlock {
  return block.typename === 'ButtonBlock'
}

/**
 * Type guard to check if a block is a TextResponseBlock
 */
export function isTextResponseBlock(block: Block): block is TextResponseBlock {
  return block.typename === 'TextResponseBlock'
}

/**
 * Type guard to check if a block is a RadioOptionBlock
 */
export function isRadioOptionBlock(block: Block): block is RadioOptionBlock {
  return block.typename === 'RadioOptionBlock'
}

/**
 * Type guard to check if a block is a RadioQuestionBlock
 */
export function isRadioQuestionBlock(
  block: Block
): block is RadioQuestionBlock {
  return block.typename === 'RadioQuestionBlock'
}

/**
 * Type union for all translatable block types
 */
export type TranslatableBlock =
  | TypographyBlock
  | ButtonBlock
  | TextResponseBlock
  | RadioOptionBlock
  | RadioQuestionBlock

/**
 * Type union for all block types
 */
export type AnyBlock =
  | TranslatableBlock
  | CardBlock
  | StepBlock
  | ImageBlock
  | VideoBlock
  | SpacerBlock
  | GridContainerBlock
  | GridItemBlock
  | IconBlock

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
