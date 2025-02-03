import { z } from 'zod'

const ThemeModeSchema = z.enum(['dark', 'light'])
const ThemeNameSchema = z.enum(['base'])

export { ThemeModeSchema, ThemeNameSchema }
