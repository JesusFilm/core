import { renderHook } from '@testing-library/react'
import { BaseHit, Hit } from 'instantsearch.js'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'

import {
  StrategyItem,
  transformAlgoliaStrategies,
  useAlgoliaStrategies
} from './useAlgoliaStrategies'

jest.mock('react-instantsearch')

const mockUseHits = useHits as jest.MockedFunction<typeof useHits>

describe('useAlgoliaStrategies', () => {
  const algoliaStrategyItem = {
    post_id: 1,
    post_type: 'mission-trip',
    post_type_label: 'Mission Trips',
    post_title: 'title',
    post_date: 1671059126,
    post_date_formatted: '12/14/2022',
    post_modified: 1717597535,
    images: {
      thumbnail: {
        url: 'https://example.com/image.jpg',
        width: '150',
        height: '150'
      }
    },
    permalink: 'https://example.com/test-page/',
    content: 'description',
    objectID: '1'
  } as unknown as Hit<BaseHit>

  const strategyItem = {
    id: '1',
    title: 'title',
    description: 'description',
    imageUrl: 'https://example.com/image.jpg',
    link: 'https://example.com/test-page/'
  } as unknown as StrategyItem

  beforeEach(() => {
    mockUseHits.mockReturnValue({
      hits: [algoliaStrategyItem]
    } as unknown as HitsRenderState)
    jest.clearAllMocks()
  })

  it('should transform strategy hits into strategy item', () => {
    const transformedHits = transformAlgoliaStrategies([algoliaStrategyItem])
    expect(transformedHits).toEqual([strategyItem])
  })

  it('should return hits', () => {
    const { result } = renderHook(() => useAlgoliaStrategies())
    expect(result.current.hits).toEqual([strategyItem])
  })

  it('should return the label of a strategy', () => {
    const { result } = renderHook(() => useAlgoliaStrategies())
    expect(result.current.label).toBe('Mission Trips')
  })
})
