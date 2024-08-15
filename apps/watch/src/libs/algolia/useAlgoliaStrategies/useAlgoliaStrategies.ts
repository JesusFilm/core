import { BaseHit, Hit } from 'instantsearch.js'
import { useHits } from 'react-instantsearch'

export interface StrategyItem extends Hit<BaseHit> {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
}

export function transformAlgoliaStrategies(hits: Hit[]): StrategyItem[] {
  return hits.map((hit) => ({
    id: hit.objectID,
    title: hit.post_title,
    description: hit.content,
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
