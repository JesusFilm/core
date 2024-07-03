import { builder } from '../builder'
import { Language } from '../language/language'

export const Translation = builder.simpleObject('Translation', {
  fields: (t) => ({
    value: t.string({ nullable: false }),
    primary: t.boolean({ nullable: true }),
    language: t.field({ type: Language })
  })
})
