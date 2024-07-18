import { BaseHit, Hit } from 'instantsearch.js'
import { UseHitsProps, useHits, useInstantSearch } from 'react-instantsearch'

interface Tags {
  Topics: string[]
  Audience: string[]
  Holidays: string[]
  Collections: string[]
  'Felt Needs': string[]
}

interface Language {
  localName: string
  nativeName: string
  continents: string[]
}

export interface AlgoliaJourney extends Hit<BaseHit> {
  id: string
  title: string
  createdAt: Date
  description: string
  language: Language
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

export function useJourneyHits() {
  const { hits, results } = useHits<Hit<AlgoliaJourney>>({
    transformItems
  })

  const { status } = useInstantSearch()
  const loading = status === 'stalled'

  return { hits, loading }
}
