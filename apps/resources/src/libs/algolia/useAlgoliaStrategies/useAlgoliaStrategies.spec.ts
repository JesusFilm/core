import { renderHook } from '@testing-library/react'
import { BaseHit, Hit } from 'instantsearch.js'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'

import {
  StrategyItem,
  removeExcerptPTags,
  transformAlgoliaStrategies,
  useAlgoliaStrategies
} from './useAlgoliaStrategies'

jest.mock('react-instantsearch')

const mockUseHits = useHits as jest.MockedFunction<typeof useHits>

describe('removeExcerptPTags', () => {
  it('should remove p tags from excerpt', () => {
    const result = removeExcerptPTags('<p>description</p>')
    expect(result).toBe('description')
  })

  it('should remove multiple p tags from excerpt', () => {
    const result = removeExcerptPTags('<p>description</p><p>description</p>')
    expect(result).toBe('descriptiondescription')
  })

  it('should handle nested p tags', () => {
    const result = removeExcerptPTags('<p><p>description</p><p>')
    expect(result).toBe('description')
  })

  it('should handle no p tags', () => {
    const result = removeExcerptPTags('description')
    expect(result).toBe('description')
  })
})

describe('useAlgoliaStrategies', () => {
  const algoliaStrategyItem = {
    post_id: 1,
    post_type: 'mission-trip',
    post_type_label: 'Mission Trips',
    post_title: 'title',
    post_date: 1671059126,
    post_date_formatted: '12/14/2022',
    post_excerpt: '<p>description from excerpt</p>',
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
    description: 'description from excerpt',
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

  describe('transformAlgoliaStrategies child filtering', () => {
    it('should filter out child hit', () => {
      const parentHit = {
        ...algoliaStrategyItem,
        parent_id: 0
      } as unknown as Hit<BaseHit>
      const childHit = {
        ...algoliaStrategyItem,
        parent_id: 123
      } as unknown as Hit<BaseHit>
      const transformedHits = transformAlgoliaStrategies([parentHit, childHit])
      expect(transformedHits).toEqual([strategyItem])
    })

    it('should filter out multiple child hits', () => {
      const parentHit = {
        ...algoliaStrategyItem,
        parent_id: 0
      } as unknown as Hit<BaseHit>
      const childHit = {
        ...algoliaStrategyItem,
        parent_id: 123
      } as unknown as Hit<BaseHit>
      const childHit2 = {
        ...algoliaStrategyItem,
        parent_id: 456
      } as unknown as Hit<BaseHit>
      const transformedHits = transformAlgoliaStrategies([
        parentHit,
        childHit,
        childHit2
      ])
      expect(transformedHits).toEqual([strategyItem])
    })

    it('should include hit if parent_id is undefined', () => {
      const hit = {
        ...algoliaStrategyItem,
        parent_id: undefined
      } as unknown as Hit<BaseHit>
      const transformedHits = transformAlgoliaStrategies([hit])
      expect(transformedHits).toEqual([strategyItem])
    })

    it('should include hit if parent_id is null', () => {
      const hit = {
        ...algoliaStrategyItem,
        parent_id: null
      } as unknown as Hit<BaseHit>
      const transformedHits = transformAlgoliaStrategies([hit])
      expect(transformedHits).toEqual([strategyItem])
    })

    it('should return empty array when all hits are children', () => {
      const child1 = {
        ...algoliaStrategyItem,
        parent_id: 123
      } as unknown as Hit<BaseHit>
      const child2 = {
        ...algoliaStrategyItem,
        objectID: '2',
        parent_id: 456
      } as unknown as Hit<BaseHit>

      const transformedHits = transformAlgoliaStrategies([child1, child2])
      expect(transformedHits).toEqual([])
    })
  })
})
