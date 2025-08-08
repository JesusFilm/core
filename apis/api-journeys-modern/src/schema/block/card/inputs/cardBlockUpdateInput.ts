import { builder } from '../../../builder'
import { ThemeMode, ThemeName } from '../enums'

export const CardBlockUpdateInput = builder.inputType('CardBlockUpdateInput', {
  fields: (t) => ({
    parentBlockId: t.id({ required: false }),
    coverBlockId: t.id({ required: false }),
    backgroundColor: t.string({ required: false }),
    backdropBlur: t.int({ required: false }),
    fullscreen: t.boolean({ required: false }),
    themeMode: t.field({ type: ThemeMode, required: false }),
    themeName: t.field({ type: ThemeName, required: false })
  })
})
