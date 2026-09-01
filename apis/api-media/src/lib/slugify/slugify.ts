function ensureSlugUnique(
  id: string,
  slug: string,
  usedSlugs: Record<string, string>
): string {
  const exists = usedSlugs[slug] === id || usedSlugs[slug] == null
  if (exists) return slug
  let suffix = 2
  while (usedSlugs[`${slug}-${suffix}`] != null) {
    suffix++
  }
  return `${slug}-${suffix}`
}

export function convertToSlug(name: string): string {
  return name
    .trim()
    .replace(/^[^\p{L}\p{N}-]+/gu, '')
    .replace(/[^\p{L}\p{N}-]+$/gu, '')
    .replace(/'s/g, '')
    .replace(/â€™s/g, '')
    .replace(/['â€™,.]+/g, '')
    .replace(/ -/g, '-')
    .replace(/- /g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .toLowerCase()
}

export function slugify(
  id: string,
  title: string,
  usedSlugs: Record<string, string> = {}
): string {
  const slug = ensureSlugUnique(id, convertToSlug(title), usedSlugs)
  usedSlugs[slug] = id
  return slug
}

// A slug is public-style if it's already a fixed point of convertToSlug -
// i.e. lowercase, with runs of anything other than letters/numbers collapsed
// to single hyphens and no leading/trailing hyphen.
export function isPublicSlug(slug: string): boolean {
  return convertToSlug(slug) === slug
}
