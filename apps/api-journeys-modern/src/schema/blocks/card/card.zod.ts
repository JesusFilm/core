import { z } from 'zod'

import { ThemeModeSchema, ThemeNameSchema } from '../../../lib/theme/theme.zod'
import { BlockSchema } from '../blocks.zod'

const CardBlockSchema = BlockSchema.extend({
  backgroundColor: z.string().nullable(),
  coverBlockId: z.string().nullable(),
  fullscreen: z.boolean(),
  themeMode: ThemeModeSchema.nullable(),
  themeName: ThemeNameSchema.nullable()
})

export { CardBlockSchema }
