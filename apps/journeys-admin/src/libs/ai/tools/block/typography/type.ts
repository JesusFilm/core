import { z } from 'zod'

import { blockSchema } from '../type'

export const blockTypographyVariantEnum = z
  .enum([
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'caption',
    'overline'
  ])
  .describe('Typography style variants corresponding to MUI typography styles')

export const blockTypographyColorEnum = z
  .enum(['primary', 'secondary', 'error'])
  .describe('Color options for the typography')

export const blockTypographyAlignEnum = z
  .enum(['left', 'center', 'right'])
  .describe('Text alignment options')

export const blockTypographySchema = blockSchema.extend({
  id: z.string().describe('Unique identifier for the block'),
  __typename: z.literal('TypographyBlock'),
  content: z.string().describe('Text content of the typography block'),
  variant: blockTypographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: blockTypographyColorEnum.optional().describe('Color of the text'),
  align: blockTypographyAlignEnum.optional().describe('Text alignment')
})

export const blockTypographyCreateInputSchema = z.object({
  id: z.string().optional().describe('Optional ID for the new block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z.string().describe('ID of the parent block'),
  content: z.string().describe('Text content of the typography block'),
  variant: blockTypographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: blockTypographyColorEnum.optional().describe('Color of the text'),
  align: blockTypographyAlignEnum.optional().describe('Text alignment')
})

export const blockTypographyUpdateInputSchema = z.object({
  parentBlockId: z.string().optional().describe('ID of the parent block'),
  content: z
    .string()
    .optional()
    .describe('Text content of the typography block'),
  variant: blockTypographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: blockTypographyColorEnum.optional().describe('Color of the text'),
  align: blockTypographyAlignEnum.optional().describe('Text alignment')
})
