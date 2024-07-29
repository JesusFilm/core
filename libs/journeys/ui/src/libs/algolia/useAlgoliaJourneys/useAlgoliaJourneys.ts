import { LanguageOption } from '@core/shared/ui/MultipleLanguageAutocomplete'
import type { SearchResults } from 'algoliasearch-helper'
import { BaseHit, Hit } from 'instantsearch.js'
import {
  UseHitsProps,
  useCurrentRefinements,
  useHits,
  useInstantSearch,
  useRefinementList
} from 'react-instantsearch'
import { convertLanguagesToOptions } from '../../../components/TemplateGallery/HeaderAndLanguageFilter/convertLanguagesToOptions'
import { useLanguagesQuery } from '../../useLanguagesQuery'

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
  results?: SearchResults<Hit<BaseHit>> | undefined
  loading: boolean
  refinements: string[]
}

export function enrichHits(
  hits: Hit<BaseHit>[],
  languageOptions: LanguageOption[]
) {
  return hits.map((item) => ({
    ...item,
    language: {
      localName:
        languageOptions.find(({ id }) => item.languageId === id)?.localName ??
        '',
      nativeName:
        languageOptions.find(({ id }) => item.languageId === id)?.nativeName ??
        ''
    }
  })) as unknown as AlgoliaJourney[]
}

export const transformItems: UseHitsProps['transformItems'] = (items) => {
  return items.map((item) => ({
    ...item,
    id: item.objectID,
    createdAt: item.date,
    primaryImageBlock: item.image
  }))
}

export function useAlgoliaJourneys(): UseJourneyHitsResults {
  const { data } = useLanguagesQuery({
    languageId: '529'
  })
  const languageOptions = convertLanguagesToOptions(data?.languages)

  const { hits, results } = useHits({
    transformItems
  })
  const enrichedJourneys = enrichHits(hits, languageOptions)

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

  return { hits: enrichedJourneys, results, loading, refinements }
}
