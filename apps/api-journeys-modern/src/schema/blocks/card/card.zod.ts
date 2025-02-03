import { z } from 'zod'

const ThemeMode = z.enum(['light', 'dark'])
const ThemeName = z.enum(['default', 'custom'])

const CardBlock = z.object({
  id: z.string(),
  journeyId: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable(),
  backgroundColor: z.string().nullable(),
  coverBlockId: z.string().nullable(),
  fullscreen: z.boolean(),
  themeMode: ThemeMode.optional(),
  themeName: ThemeName.optional()
})

export { CardBlock, ThemeMode, ThemeName }
