import { renderHook } from '@testing-library/react'
import type { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import {
  type InstantSearchApi,
  useInfiniteHits,
  useInstantSearch
} from 'react-instantsearch'

import type { AlgoliaVideo, CoreVideo } from './useAlgoliaVideos'
import { transformItems, useAlgoliaVideos } from './useAlgoliaVideos'

jest.mock('react-instantsearch')

const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>

describe('useAlgoliaVideos', () => {
  const algoliaVideos = [
    {
      videoId: 'videoId',
      titles: ['title1'],
      description: ['description'],
      duration: 10994,
      languageId: '529',
      subtitles: [],
      slug: 'video-slug/english',
      label: 'featureFilm',
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
      imageAlt: 'Life of Jesus (Gospel of John)',
      childrenCount: 49,
      objectID: '2_529-GOJ-0-0'
    }
  ] as unknown as AlgoliaVideo[]

  const transformedVideos = [
    {
      __typename: 'Video',
      childrenCount: 49,
      id: 'videoId',
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
      imageAlt: [
        {
          value: 'Life of Jesus (Gospel of John)'
        }
      ],
      label: 'featureFilm',
      slug: 'video-slug/english',
      snippet: [],
      title: [
        {
          value: 'title1'
        }
      ],
      variant: {
        duration: 10994,
        hls: null,
        id: '2_529-GOJ-0-0',
        slug: 'video-slug/english'
      }
    }
  ] as unknown as CoreVideo[]

  beforeEach(() => {
    mockUseInfiniteHits.mockReturnValue({
      hits: algoliaVideos,
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle',
      results: {
        __isArtificial: false,
        nbHits: algoliaVideos.length
      }
    } as unknown as InstantSearchApi)
  })

  it('should have transformed algolia hits into videos', () => {
    const transformedItems = transformItems(algoliaVideos)
    transformedItems.forEach((item) => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('snippet')
      expect(item).toHaveProperty('variant')
    })
  })

  it('should return hits', async () => {
    const { result } = renderHook(() => useAlgoliaVideos())
    await expect(result.current.hits.length).toBeGreaterThan(0)
    expect(result.current.hits).toEqual([...transformedVideos])
  })

  it('should return showMore', () => {
    const { result } = renderHook(() => useAlgoliaVideos())
    expect(result.current.showMore).toBeDefined()
  })

  it('should return isLastPage', () => {
    const { result } = renderHook(() => useAlgoliaVideos())
    expect(result.current.isLastPage).toBe(false)
  })
})
