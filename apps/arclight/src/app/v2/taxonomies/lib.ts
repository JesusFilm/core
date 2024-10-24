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
  names: Array<{ label: string; languageCode: string }>,
  preferredLanguages: string[]
): { label: string; languageCode: string } => {
  console.log('INSIDE findBestMatchingName')
  console.log('names', names)
  console.log('preferredLanguages', preferredLanguages)

  for (const preferredLanguage of preferredLanguages) {
    const match = names.find((name) => name.languageCode === preferredLanguage)
    if (match !== undefined) return match
  }
  return names[0]
}
