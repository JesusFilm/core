import {
  InstantSearchApi,
  useCurrentRefinements,
  useHits,
  useInstantSearch
} from 'react-instantsearch'
import { algoliaJourneys, algoliaRefinements, algoliaResults } from './data'
import { transformItems, useAlgoliaJourneys } from './useAlgoliaJourneys'

import { CurrentRefinementsRenderState } from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'

jest.mock('react-instantsearch')

describe('useAlgoliaJourneys', () => {
  beforeEach(() => {
    const useHitsMocked = jest.mocked(useHits)
    useHitsMocked.mockReturnValue({
      hits: algoliaJourneys,
      results: algoliaResults
    } as unknown as HitsRenderState)

    const useInstantSearchMocked = jest.mocked(useInstantSearch)
    useInstantSearchMocked.mockReturnValue({
      status: 'idle'
    } as unknown as InstantSearchApi)

    const useCurrentRefinementsMocked = jest.mocked(useCurrentRefinements)
    useCurrentRefinementsMocked.mockReturnValue({
      items: []
    } as unknown as CurrentRefinementsRenderState)
  })

  it('should have transformed algolia hits into algolia journeys', () => {
    if (transformItems) {
      const transformedItems = transformItems(algoliaJourneys, {})
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

  it('should return hits', () => {
    const { hits } = useAlgoliaJourneys()
    expect(hits).toBeDefined()
  })

  it('should return results', () => {
    const { results } = useAlgoliaJourneys()
    expect(results).toBeDefined()
  })

  it('should return loading', () => {
    const { loading } = useAlgoliaJourneys()
    expect(loading).toBeDefined()
  })

  it('should return refinements', () => {
    const { refinements } = useAlgoliaJourneys()
    expect(refinements).toBeDefined()
  })

  it('should return algolia journeys', () => {
    const { hits } = useAlgoliaJourneys()
    expect(hits).toHaveLength(6)
  })

  it('should return flattened refinements', () => {
    const useCurrentRefinementsMocked = jest.mocked(useCurrentRefinements)
    useCurrentRefinementsMocked.mockReturnValue({
      items: algoliaRefinements
    } as unknown as CurrentRefinementsRenderState)
    const { refinements } = useAlgoliaJourneys()
    expect(refinements).toEqual(['Depression', 'Acceptance'])
  })
})
