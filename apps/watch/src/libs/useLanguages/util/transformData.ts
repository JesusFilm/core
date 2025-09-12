import { z } from 'zod'

import { getLanguageIdFromLocale } from '../../getLanguageIdFromLocale'
import { type Language } from '../useLanguages'

export function transformData(data: unknown, locale: string): Language[] {
  const currentLanguageId = getLanguageIdFromLocale(locale)
  const parsedData = z.array(z.array(z.string())).parse(data)

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
