import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const TypographyVariantSchema = z.enum([
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

const TypographyColorSchema = z.enum(['primary', 'secondary', 'error'])
const TypographyAlignSchema = z.enum(['left', 'center', 'right'])

const TypographyBlockSchema = BlockSchema.extend({
  content: z.string(),
  variant: TypographyVariantSchema.nullable(),
  color: TypographyColorSchema.nullable(),
  align: TypographyAlignSchema.nullable()
})

export {
  TypographyVariantSchema,
  TypographyColorSchema,
  TypographyAlignSchema,
  TypographyBlockSchema
}
