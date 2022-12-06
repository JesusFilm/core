function ensureSlugUnique(slug: string, usedSlugs: string[]): string {
  const exists = usedSlugs.find((t) => t === slug)
  if (exists == null) return slug
  let suffix = 2
  while (usedSlugs.find((t) => t === `${slug}-${suffix}`) != null) {
    suffix++
  }
  return `${slug}-${suffix}`
}

function convertToSlug(name: string): string {
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

export function slugify(title: string, usedSlugs: string[] = []): string {
  const slug = ensureSlugUnique(convertToSlug(title), usedSlugs)
  usedSlugs.push(slug)
  return slug
}
