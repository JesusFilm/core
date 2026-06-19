import { z } from 'zod'

import { getLanguageIdFromLocale } from '../../getLanguageIdFromLocale'
import { type Language } from '../useLanguages'

export function transformData(data: unknown, locale: string): Language[] {
  const currentLanguageId = getLanguageIdFromLocale(locale)
  // The languages API can return a non-array error body (e.g. a 500
  // `{ error: '...' }`). Degrade gracefully instead of throwing, which would
  // crash the entire page rather than just leaving the language filter empty.
  const result = z.array(z.array(z.string())).safeParse(data)
  if (!result.success) return []
  const parsedData = result.data

  return parsedData.map((language) => {
    const [languageIdSlugNative, ...names] = language
    const [id, slug, native] = languageIdSlugNative.split(':')
    const transformedNames: {
      id: string
      primary: boolean
      value: string
    }[] = names.map((returnedName) => {
      const [id, nameValue] = returnedName.split(':')
      return {
        id,
        primary: false,
        value: nameValue
      }
    })
    const name =
      transformedNames.find((name) => name.id === currentLanguageId) ??
      (native != null && id === currentLanguageId
        ? {
            id,
            primary: true,
            value: native
          }
        : undefined)
    const englishName =
      transformedNames.find((name) => name.id == '529') ??
      (native != null && id === '529'
        ? {
            id,
            primary: true,
            value: native
          }
        : undefined)
    const nativeName =
      native != null && id !== currentLanguageId
        ? {
            id,
            primary: true,
            value: native
          }
        : undefined

    return {
      id,
      slug,
      name,
      englishName,
      nativeName,
      displayName: englishName?.value ?? nativeName?.value ?? id
    }
  })
}
