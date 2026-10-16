interface SortableLanguageOption {
  localName?: string
  nativeName?: string
}

/**
 * Returns a new array of language options sorted alphabetically by local
 * (English) name, falling back to the native name when there is none.
 */
export function sortLanguageOptions<T extends SortableLanguageOption>(
  options: T[]
): T[] {
  return [...options].sort((a, b) =>
    (a.localName ?? a.nativeName ?? '').localeCompare(
      b.localName ?? b.nativeName ?? ''
    )
  )
}
