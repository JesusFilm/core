import { z } from 'zod'

const TypographyVariant = z.enum([
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

const TypographyColor = z.enum(['primary', 'secondary', 'error'])

const TypographyAlign = z.enum(['left', 'center', 'right'])

const TypographyBlock = z.object({
  id: z.string(),
  journeyId: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable(),
  content: z.string(),
  variant: TypographyVariant,
  color: TypographyColor,
  align: TypographyAlign
})

export { TypographyVariant, TypographyColor, TypographyAlign, TypographyBlock }
