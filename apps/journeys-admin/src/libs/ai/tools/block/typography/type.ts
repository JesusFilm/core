import { z } from 'zod'

import { BlockFields_TypographyBlock } from '../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyBlockCreateInput,
  TypographyBlockUpdateInput,
  TypographyColor,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'
import { blockSchema } from '../type'

export const blockTypographyVariantEnum = z
  .nativeEnum(TypographyVariant)
  .describe('Typography style variants corresponding to MUI typography styles')

export const blockTypographyColorEnum = z
  .nativeEnum(TypographyColor)
  .describe('Color options for the typography')

export const blockTypographyAlignEnum = z
  .nativeEnum(TypographyAlign)
  .describe('Text alignment options')

export const blockTypographySchema = blockSchema.extend({
  id: z.string().describe('Unique identifier for the block'),
  __typename: z.literal('TypographyBlock'),
  content: z.string().describe('Text content of the typography block'),
  variant: blockTypographyVariantEnum
    .nullable()
    .describe('Typography style variant'),
  color: blockTypographyColorEnum.nullable().describe('Color of the text'),
  align: blockTypographyAlignEnum.nullable().describe('Text alignment')
}) satisfies z.ZodType<BlockFields_TypographyBlock>

export const blockTypographyCreateInputSchema = z.object({
  id: z.string().optional().describe('Optional ID for the new block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z
    .string()
    .describe('ID of the parent block. The parent block must be a card block!'),
  content: z.string().describe('Text content of the typography block'),
  variant: blockTypographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: blockTypographyColorEnum.optional().describe('Color of the text'),
  align: blockTypographyAlignEnum.optional().describe('Text alignment')
}) satisfies z.ZodType<TypographyBlockCreateInput>

export const blockTypographyUpdateInputSchema = z.object({
  parentBlockId: z
    .string()
    .optional()
    .describe('ID of the parent block. The parent block must be a card block!'),
  content: z
    .string()
    .optional()
    .describe('Text content of the typography block'),
  variant: blockTypographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: blockTypographyColorEnum.optional().describe('Color of the text'),
  align: blockTypographyAlignEnum.optional().describe('Text alignment')
}) satisfies z.ZodType<TypographyBlockUpdateInput>
