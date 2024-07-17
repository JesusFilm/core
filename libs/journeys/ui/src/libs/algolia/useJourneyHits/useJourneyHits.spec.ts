import {
  InstantSearchApi,
  useHits,
  useInstantSearch
} from 'react-instantsearch'
import { algoliaJourneys } from './data'
import { transformItems, useJourneyHits } from './useJourneyHits'

import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'

jest.mock('react-instantsearch')

describe('useJourneyHits', () => {
  it('should have added missing attributes', () => {
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

  beforeEach(() => {
    const useHitsMocked = jest.mocked(useHits)
    useHitsMocked.mockReturnValue({
      hits: algoliaJourneys
    } as unknown as HitsRenderState)

    const useInstantSearchMocked = jest.mocked(useInstantSearch)
    useInstantSearchMocked.mockReturnValue({
      status: 'idle'
    } as unknown as InstantSearchApi)
  })

  it('should return hits', () => {
    const { hits } = useJourneyHits()
    expect(hits).toBeDefined()
  })

  it('should return loading', () => {
    const { loading } = useJourneyHits()
    expect(loading).toBeDefined()
  })

  it('should return algolia journeys', () => {
    const { hits } = useJourneyHits()
    expect(hits).toHaveLength(6)
  })

  it('should return 6 algolia journeys', () => {
    const { hits } = useJourneyHits()
    expect(hits).toHaveLength(6)
  })
})
