export interface Translation {
  value: string
  primary: boolean
}

export interface LanguageNames {
  localName: string | undefined
  nativeName: string | undefined
}

/**
 * True when both a local and a native name are present, meaning a language
 * option should render (and be sized for) two lines instead of one.
 */
export function isTwoLineOption({
  localName,
  nativeName
}: {
  localName?: string
  nativeName?: string
}): boolean {
  return localName != null && nativeName != null
}

const LATIN_NAME = /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]+$/u

/**
 * Extracts local (non-primary) and native (primary) display names from a
 * language's translation array.
 *
 * Handles edge cases:
 * - All names marked primary: true → treats index 0 as native, index 1+ as
 *   local, unless index 0 is Latin script and the other name is not (the API
 *   does not order ties, so the English name can come first)
 * - Single name only → treats it as the native name
 * - Mixed primary/non-primary → standard extraction
 */
export function extractLanguageNames(name: Translation[]): LanguageNames {
  if (name.length === 0) return { localName: undefined, nativeName: undefined }

  const nonPrimary = name.find(({ primary }) => !primary)
  const primary = name.find(({ primary: p }) => p)

  let localName: string | undefined
  let nativeName: string | undefined

  if (nonPrimary != null || primary != null) {
    localName = nonPrimary?.value
    nativeName = primary?.value
  }

  if (localName == null && nativeName == null && name.length >= 2) {
    // All names are non-primary: fall back to positional assignment
    localName = name[1].value
    nativeName = name[0].value
  } else if (localName == null && nativeName == null) {
    nativeName = name[0].value
  }

  if (localName == null && nativeName != null && name.length >= 2) {
    // Only a native name found but multiple entries exist — use the other as local
    localName = name.find(({ value }) => value !== nativeName)?.value
    const isSwapped =
      localName != null &&
      LATIN_NAME.test(nativeName) &&
      !LATIN_NAME.test(localName)
    if (isSwapped) [localName, nativeName] = [nativeName, localName]
  }

  return { localName, nativeName }
}
