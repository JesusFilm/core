import { z } from 'zod'

import { blockSchema } from './block'

export const typographyVariantEnum = z
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

// Typography Color Enum
export const typographyColorEnum = z
  .enum(['primary', 'secondary', 'error'])
  .describe('Color options for the typography')

// Typography Align Enum
export const typographyAlignEnum = z
  .enum(['left', 'center', 'right'])
  .describe('Text alignment options')

// TypographyBlock schema
export const typographyBlockSchema = blockSchema.extend({
  content: z.string().describe('Text content of the typography block'),
  variant: typographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: typographyColorEnum.optional().describe('Color of the text'),
  align: typographyAlignEnum.optional().describe('Text alignment')
})

// TypographyBlockCreateInput schema
export const typographyBlockCreateInputSchema = z.object({
  id: z.string().optional().describe('Optional ID for the new block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z.string().describe('ID of the parent block'),
  content: z.string().describe('Text content of the typography block'),
  variant: typographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: typographyColorEnum.optional().describe('Color of the text'),
  align: typographyAlignEnum.optional().describe('Text alignment')
})

// TypographyBlockUpdateInput schema
export const typographyBlockUpdateInputSchema = z.object({
  parentBlockId: z.string().optional().describe('ID of the parent block'),
  content: z
    .string()
    .optional()
    .describe('Text content of the typography block'),
  variant: typographyVariantEnum
    .optional()
    .describe('Typography style variant'),
  color: typographyColorEnum.optional().describe('Color of the text'),
  align: typographyAlignEnum.optional().describe('Text alignment')
})
