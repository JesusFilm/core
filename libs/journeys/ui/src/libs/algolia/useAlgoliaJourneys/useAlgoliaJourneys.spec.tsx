import { QueryResult } from '@apollo/client'
import { renderHook } from '@testing-library/react'
import { CurrentRefinementsRenderState } from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import {
  InstantSearchApi,
  useCurrentRefinements,
  useHits,
  useInstantSearch,
  useRefinementList
} from 'react-instantsearch'
import { useLanguagesQuery } from '../../useLanguagesQuery'
import {
  GetLanguages,
  GetLanguagesVariables
} from '../../useLanguagesQuery/__generated__/GetLanguages'
import { languages } from '../../useLanguagesQuery/useLanguageQuery.mock'
import {
  enrichHits,
  transformItems,
  useAlgoliaJourneys
} from './useAlgoliaJourneys'
import {
  algoliaHits,
  algoliaLanguageRefinements,
  algoliaRefinements,
  algoliaResults
} from './useAlgoliaJourneys.mock'

jest.mock('react-instantsearch')
jest.mock('../../useLanguagesQuery')

const mockUseHits = useHits as jest.MockedFunction<typeof useHits>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseCurrentRefinements = useCurrentRefinements as jest.MockedFunction<
  typeof useCurrentRefinements
>
const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>
const mockUseLanguagesQuery = useLanguagesQuery as jest.MockedFunction<
  typeof useLanguagesQuery
>

describe('useAlgoliaJourneys', () => {
  beforeEach(() => {
    mockUseHits.mockReturnValue({
      hits: algoliaHits,
      results: algoliaResults
    } as unknown as HitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle'
    } as unknown as InstantSearchApi)

    mockUseCurrentRefinements.mockReturnValue({
      items: []
    } as unknown as CurrentRefinementsRenderState)

    mockUseRefinementList.mockReturnValue({
      items: []
    } as unknown as RefinementListRenderState)

    mockUseLanguagesQuery.mockReturnValue({
      data: []
    } as unknown as QueryResult<GetLanguages, GetLanguagesVariables>)
  })

  it('should have transformed algolia hits into algolia journeys', () => {
    if (transformItems) {
      const transformedItems = transformItems(algoliaHits, {})
      expect(transformedItems.every((item) => item.id === item.objectID)).toBe(
        true
      )
      expect(
        transformedItems.every((item) => item.createdAt === item.date)
      ).toBe(true)
      expect(
        transformedItems.every((item) => item.primaryImageBlock === item.image)
      ).toBe(true)
    }
  })

  it('should set empty strings for language when no languages', () => {
    const enrichedJourneys = enrichHits(algoliaHits, [])

    expect(enrichedJourneys.every((item) => item.language !== undefined)).toBe(
      true
    )
    expect(
      enrichedJourneys.every((item) => item.language.localName === '')
    ).toBe(true)
    expect(
      enrichedJourneys.every((item) => item.language.nativeName === '')
    ).toBe(true)
  })

  it('should enrich hits with language names', () => {
    mockUseLanguagesQuery.mockReturnValue({
      data: {
        languages: languages
      }
    } as unknown as QueryResult<GetLanguages, GetLanguagesVariables>)
    const options = [
      { id: '529', localName: undefined, nativeName: 'English' },
      { id: '496', localName: 'French', nativeName: 'Français' },
      { id: '1106', localName: 'German, Standard', nativeName: 'Deutsch' }
    ]

    const enrichedJourneys = enrichHits(algoliaHits, options)

    expect(enrichedJourneys.every((item) => item.language !== undefined)).toBe(
      true
    )
    expect(enrichedJourneys[0].language).toEqual({
      localName: '',
      nativeName: 'English'
    })
  })

  it('should return hits', () => {
    const { result } = renderHook(() => useAlgoliaJourneys())
    expect(result.current.hits).toBeDefined()
  })

  it('should return results', () => {
    const { result } = renderHook(() => useAlgoliaJourneys())
    expect(result.current.results).toBeDefined()
  })

  it('should return loading', () => {
    const { result } = renderHook(() => useAlgoliaJourneys())
    expect(result.current.loading).toBeDefined()
  })

  it('should return refinements', () => {
    const { result } = renderHook(() => useAlgoliaJourneys())
    expect(result.current.refinements).toBeDefined()
  })

  it('should return algolia journeys', () => {
    const { result } = renderHook(() => useAlgoliaJourneys())
    expect(result.current.hits).toHaveLength(6)
  })

  it('should return flattened refinements', () => {
    mockUseCurrentRefinements.mockReturnValue({
      items: algoliaRefinements
    } as unknown as CurrentRefinementsRenderState)

    const { result } = renderHook(() => useAlgoliaJourneys())

    expect(result.current.refinements).toEqual(['Depression', 'Acceptance'])
  })

  it('should not return language refinements', () => {
    mockUseRefinementList.mockReturnValue({
      items: algoliaLanguageRefinements
    } as unknown as RefinementListRenderState)
    mockUseCurrentRefinements.mockReturnValue({
      items: algoliaRefinements
    } as unknown as CurrentRefinementsRenderState)

    const { result } = renderHook(() => useAlgoliaJourneys())

    expect(result.current.refinements.includes('English')).toBeFalsy()
  })
})
