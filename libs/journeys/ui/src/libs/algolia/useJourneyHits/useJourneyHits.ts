import { BaseHit, Hit } from 'instantsearch.js'
import { UseHitsProps, useHits, useInstantSearch } from 'react-instantsearch'

interface Tags {
  Topics: string[]
  Audience: string[]
  Holidays: string[]
  Collections: string[]
  'Felt Needs': string[]
}

export interface AlgoliaJourney extends Hit<BaseHit> {
  id: string
  title: string
  createdAt: Date
  description: string
  language: string
  primaryImageBlock: {
    src: string
    alt: string
  }
  featuredAt: string | null
  tags: Tags
}

export const transformItems: UseHitsProps<AlgoliaJourney>['transformItems'] = (
  items
) => {
  return items.map((item) => ({
    ...item,
    id: item.objectID,
    createdAt: item.date,
    primaryImageBlock: item.image
  })) as unknown as AlgoliaJourney[]
}

export function transformItemsOther(items: any[]): AlgoliaJourney[] {
  return items.map((item) => ({
    ...item,
    id: item.objectID,
    createdAt: item.date,
    primaryImageBlock: item.image
  })) as unknown as AlgoliaJourney[]
}

export function useJourneyHits() {
  const { hits } = useHits<Hit<AlgoliaJourney>>({
    transformItems
  })
  const { status } = useInstantSearch()
  const loading = status === 'stalled'

  return { hits, loading }
}
