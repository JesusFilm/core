import { MaybePromise } from '@pothos/core'
import { builder } from '../builder'
import { Language } from '../language'

interface TranslationShape {
  value: string
  primary: boolean
  language: MaybePromise<{
    id: string
    bcp47: string | null
    iso3: string | null
    createdAt: Date
    updatedAt: Date
  }>
}

export const Translation = builder.objectRef<TranslationShape>('Translation')

builder.objectType(Translation, {
  shareable: true,
  fields: (t) => ({
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: true }),
    language: t.field({
      type: Language,
      resolve: (parent) => parent.language
    })
  })
})
