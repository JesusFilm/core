import { builder } from '../builder'

export const Language = builder.externalRef(
  'Language',
  builder.keyDirective(builder.selection<{ id: string }>('id'))
)

Language.implement({
  externalFields: (t) => ({ id: t.id() })
})

interface LanguageWithSlugShape {
  language: { id: string }
  slug: string
}

export const LanguageWithSlug =
  builder.objectRef<LanguageWithSlugShape>('LanguageWithSlug')

LanguageWithSlug.implement({
  fields: (t) => ({
    language: t.field({
      type: Language,
      resolve: ({ language: { id } }) => ({ id })
    }),
    slug: t.exposeString('slug')
  })
})
