import { z } from 'zod'

import { ThemeModeSchema, ThemeNameSchema } from '../../../lib/theme/theme.zod'
import { BlockSchema } from '../blocks.zod'

const CardBlockSchema = BlockSchema.extend({
  backgroundColor: z
    .string()
    .nullable()
    .describe('Background color of the card block'),
  coverBlockId: z.string().nullable().describe('ID of the cover block'),
  fullscreen: z.boolean().describe('Indicates if the card block is fullscreen'),
  themeMode: ThemeModeSchema.nullable().describe(
    'Theme mode of the card block'
  ),
  themeName: ThemeNameSchema.nullable().describe('Theme name of the card block')
})

export { CardBlockSchema }
