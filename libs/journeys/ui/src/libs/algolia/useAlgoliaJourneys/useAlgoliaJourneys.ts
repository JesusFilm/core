import type { SearchResults } from 'algoliasearch-helper'
import { BaseHit, Hit } from 'instantsearch.js'
import {
  UseHitsProps,
  useCurrentRefinements,
  useHits,
  useInstantSearch,
  useRefinementList
} from 'react-instantsearch'

interface Tags {
  Topics: string[]
  Audience: string[]
  Holidays: string[]
  Collections: string[]
  'Felt Needs': string[]
}

export interface Language {
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

export interface UseJourneyHitsResults {
  hits: AlgoliaJourney[]
  results?: SearchResults<Hit<AlgoliaJourney>> | undefined
  loading: boolean
  refinements: string[]
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

export function useAlgoliaJourneys(): UseJourneyHitsResults {
  const { hits, results } = useHits<AlgoliaJourney>({
    transformItems
  })

  const { status } = useInstantSearch()
  const loading = status === 'stalled'

  // Filter out language refinements
  const { items: languageRefinements } = useRefinementList({
    attribute: 'language.localName'
  })
  const languages = languageRefinements.flatMap((ref) => ref.label)
  languages.push('English')

  const { items } = useCurrentRefinements()
  const refinements = items
    .flatMap((refinement) => refinement.refinements.flatMap((ref) => ref.label))
    .filter((ref) => !languages.includes(ref))

  return { hits, results, loading, refinements }
}
