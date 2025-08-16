import { builder } from '../../../builder'
import { ThemeMode, ThemeName } from '../enums'

export const CardBlockCreateInput = builder.inputType('CardBlockCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    journeyId: t.id({ required: true }),
    parentBlockId: t.id({ required: true }),
    backgroundColor: t.string({
      required: false
    }),
    backdropBlur: t.int({
      required: false
    }),
    fullscreen: t.boolean({ required: false }),
    themeMode: t.field({ type: ThemeMode, required: false }),
    themeName: t.field({ type: ThemeName, required: false })
  })
})
