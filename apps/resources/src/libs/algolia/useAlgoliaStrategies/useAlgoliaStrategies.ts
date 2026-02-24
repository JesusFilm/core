import { BaseHit, Hit } from 'instantsearch.js'
import { useHits } from 'react-instantsearch'

export function removeExcerptPTags(excerpt: string): string {
  return excerpt.replace(/<\/?p>/g, '')
}

export interface StrategyItem extends Hit<BaseHit> {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
}

export function transformAlgoliaStrategies(hits: Hit[]): StrategyItem[] {
  return hits
    .filter((hit) => {
      // Filter out child posts (only show top-level posts with no parent)
      // Posts with parent_id = 0 or undefined are top-level posts
      return !hit.parent_id || hit.parent_id === 0
    })
    .map((hit) => ({
      id: hit.objectID,
      title: hit.post_title,
      description: removeExcerptPTags(hit.post_excerpt),
      imageUrl: hit.images.thumbnail?.url,
      link: hit.permalink
    })) as unknown as StrategyItem[]
}

export function useAlgoliaStrategies(): {
  label: string
  hits: StrategyItem[]
} {
  const { hits } = useHits()

  const transformedHits = transformAlgoliaStrategies(hits)

  const label = (hits[0]?.post_type_label as string) ?? ''

  return {
    label,
    hits: transformedHits
  }
}
