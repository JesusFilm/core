import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const TypographyVariantSchema = z
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
  .describe('Variant of the typography such as h1, h2, body1, caption, etc.')

const TypographyColorSchema = z
  .enum(['primary', 'secondary', 'error'])
  .describe(
    'Color of the typography which could be primary, secondary, or error.'
  )

const TypographyAlignSchema = z
  .enum(['left', 'center', 'right'])
  .describe('Alignment of the typography such as left, center, or right.')

const TypographyBlockSchema = BlockSchema.extend({
  content: z.string().describe('Content of the typography block as a string.'),
  variant: TypographyVariantSchema.nullable().describe(
    'Optional variant of the typography.'
  ),
  color: TypographyColorSchema.nullable().describe(
    'Optional color of the typography.'
  ),
  align: TypographyAlignSchema.nullable().describe(
    'Optional text alignment of the typography.'
  )
}).describe('Schema for a Typography block.')

export {
  TypographyVariantSchema,
  TypographyColorSchema,
  TypographyAlignSchema,
  TypographyBlockSchema
}
