import { render } from '@testing-library/react'
import {
  InstantSearchApi,
  useHits,
  useInstantSearch,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'
import { InstantSearchTestWrapper } from '../../../../test/mocks/InstantSearchWrapper'
import {
  createMultiSearchResponse,
  createSFFVResponse,
  createSingleSearchResponse
} from '../../../../test/mocks/createAPIResponse'
import { createSearchClient } from '../../../../test/mocks/createSearchClient'
import { TemplateSections } from '../../../components/TemplateSections'
import { FACET_HITS, algoliaJourneys } from './data'
import { transformItems, useJourneyHits } from './useJourneyHits'

import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'

jest.mock('react-instantsearch')

function createMockedSearchClient(parameters: Record<string, any> = {}) {
  return createSearchClient({
    search: jest.fn((requests) => {
      return Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              facets: {
                language: {
                  English: 6
                },
                tags: {
                  Audience: 2,
                  Collections: 2,
                  'Felt Needs': 2,
                  Holidays: 2,
                  Topics: 2
                }
              }
            })
          )
        )
      )
    }),
    searchForFacetValues: jest.fn(() =>
      Promise.resolve([
        createSFFVResponse({
          facetHits: FACET_HITS
        })
      ])
    ),
    ...parameters
  })
}

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
