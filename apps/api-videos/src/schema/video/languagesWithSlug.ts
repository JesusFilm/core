import { builder } from '../builder'
import { Language } from './language'

interface LanguageWithSlugShape {
  language: { id: string }
  slug: string
}
export const LanguageWithSlug = builder
  .objectRef<LanguageWithSlugShape>('LanguageWithSlug')
  .implement({
    fields: (t) => ({
      language: t.field({
        type: Language,
        resolve: (parent) => ({ id: parent.language.id })
      }),
      slug: t.exposeString('slug')
    })
  })
