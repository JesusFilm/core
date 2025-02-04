import { z } from 'zod'

import { ThemeModeSchema, ThemeNameSchema } from '../../../lib/theme/theme.zod'
import { BlockSchema } from '../blocks.zod'

const CardBlockSchema = BlockSchema.extend({
  typename: z.literal('CardBlock').describe('This value must be "CardBlock".'),
  backgroundColor: z
    .string()
    .nullable()
    .describe('Background color of the card block'),
  coverBlockId: z
    .string()
    .nullable()
    .describe(
      'this ID can reference an existing ImageBlock to set the background image of the card. This can be more helpful that just injecting the Image into the card as a generic block'
    ),
  fullscreen: z.boolean().describe('Indicates if the card block is fullscreen'),
  themeMode: ThemeModeSchema.nullable().describe(
    'Theme mode of the card block'
  ),
  themeName: ThemeNameSchema.nullable().describe(
    'Theme name of the card block'
  ),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe(
      'This is the CardBlock id, which is the only child of the StepBlock.'
    )
})

export { CardBlockSchema }
