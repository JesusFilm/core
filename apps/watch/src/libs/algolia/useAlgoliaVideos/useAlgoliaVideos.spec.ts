import { renderHook } from '@testing-library/react'
import { ConfigureRenderState } from 'instantsearch.js/es/connectors/configure/connectConfigure'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import {
  useConfigure,
  useInfiniteHits,
  useRefinementList
} from 'react-instantsearch'
import { transformAlgoliaVideos, useAlgoliaVideos } from './useAlgoliaVideos'

jest.mock('react-instantsearch')

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
  ]

  beforeEach(() => {
    const useInfiniteHitsMocked = jest.mocked(useInfiniteHits)
    useInfiniteHitsMocked.mockReturnValue({
      hits: algoliaVideos,
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    const useRefinementListMocked = jest.mocked(useRefinementList)
    useRefinementListMocked.mockReturnValue({
      items: [
        {
          count: 753,
          isRefined: false,
          value: '529',
          label: '529',
          highlighted: '529'
        }
      ]
    } as unknown as RefinementListRenderState)

    const useConfigureMocked = jest.fn(useConfigure)
    useConfigureMocked.mockReturnValue({
      facetsRefinements: {
        languageId: ['529']
      }
    } as unknown as ConfigureRenderState)
  })

  it('should have transformed algolia hits into videos', () => {
    const transformedItems = transformAlgoliaVideos(algoliaVideos)
    expect(transformedItems).toEqual([
      {
        childrenCount: 49,
        id: 'videoId',
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
        imageAlt: 'Life of Jesus (Gospel of John)',
        label: 'featureFilm',
        slug: 'video-slug/english',
        snippet: [],
        title: [
          {
            value: ['title1']
          }
        ],
        variant: {
          duration: 10994,
          hls: null,
          id: '2_529-GOJ-0-0',
          slug: 'video-slug/english'
        }
      }
    ])
  })

  it('should return hits', async () => {
    const { result } = renderHook(() => useAlgoliaVideos())
    await expect(result.current.hits).toEqual([...algoliaVideos])
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
