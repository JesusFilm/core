import { ThemeMode } from '../../block/card/enums/themeMode'
import { ThemeName } from '../../block/card/enums/themeName'
import { builder } from '../../builder'

export const JourneyCreateInput = builder.inputType('JourneyCreateInput', {
  fields: (t) => ({
    id: t.id({
      required: false,
      description:
        'ID should be unique Response UUID (Provided for optimistic mutation result matching)'
    }),
    title: t.string({ required: true }),
    languageId: t.string({ required: true }),
    themeMode: t.field({ type: ThemeMode, required: false }),
    themeName: t.field({ type: ThemeName, required: false }),
    description: t.string({ required: false }),
    slug: t.string({
      required: false,
      description:
        'Slug should be unique amongst all journeys (server will throw BAD_USER_INPUT error if not). If not required will use title formatted with kebab-case. If the generated slug is not unique the uuid will be placed at the end of the slug guaranteeing uniqueness'
    })
  })
})
