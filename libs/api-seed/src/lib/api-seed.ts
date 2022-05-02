import slugify from 'slugify'

export function getIteration(slug: string, collection: string[]): string {
  const exists = collection.find((t) => t === slug)
  if (exists != null && slug !== '') {
    const regex = slug.match(/^(.*?)\-(\d+)$/)
    const iteration = parseInt(regex?.[2] ?? '1') + 1
    const title = regex?.[1] ?? slug
    const value = `${title}-${iteration}`
    return getIteration(value, collection)
  }
  return slug
}

export function getSeoSlug(title: string, collection: string[]): string {
  const slug = slugify(title, { lower: true, remove: /[^a-zA-Z\d\s:]/g })
  const newSlug = getIteration(slug, collection)
  collection.push(newSlug)
  return newSlug
}
