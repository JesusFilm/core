export interface TaxonomyGroup {
  terms: Record<
    string,
    {
      label: string
      metadataLanguageTag: string
    }
  >
  _links: {
    self: { href: string }
    taxonomies: { href: string }
  }
}

export const findBestMatchingName = (
  names: Array<{ label: string; language: { bcp47: string } }>,
  preferredLanguages: string[]
): { label: string; language: { bcp47: string } } => {
  for (const preferredLanguage of preferredLanguages) {
    const match = names.find(
      (name) => name.language.bcp47 === preferredLanguage
    )
    if (match !== undefined) return match
  }
  return names[0]
}
