import { builder } from '../../../builder'
import { ThemeMode, ThemeName } from '../enums'

export const CardBlockCreateInput = builder.inputType('CardBlockCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    journeyId: t.id({ required: true }),
    parentBlockId: t.id({ required: true }),
    backgroundColor: t.string({
      required: false,
      description:
        'backgroundColor should be a HEX color value e.g #FFFFFF for white.'
    }),
    backdropBlur: t.int({
      required: false,
      description:
        'backdropBlur should be a number representing blur amount in pixels e.g 20.'
    }),
    fullscreen: t.boolean({ required: false }),
    themeMode: t.field({ type: ThemeMode, required: false }),
    themeName: t.field({ type: ThemeName, required: false })
  })
})
