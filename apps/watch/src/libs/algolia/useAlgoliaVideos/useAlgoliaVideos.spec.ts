import { renderHook } from '@testing-library/react'
import type { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import type { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { type NextRouter, useRouter } from 'next/router'
import {
  type InstantSearchApi,
  useInfiniteHits,
  useInstantSearch,
  useRefinementList
} from 'react-instantsearch'

import type { AlgoliaVideo, CoreVideo } from './useAlgoliaVideos'
import { transformItems, useAlgoliaVideos } from './useAlgoliaVideos'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('react-instantsearch')

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>
const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
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

    mockUseRefinementList.mockReturnValue({
      items: [],
      refine: jest.fn()
    } as unknown as RefinementListRenderState)

    mockUseRouter.mockReturnValue({
      asPath: '/watch'
    } as unknown as NextRouter)
  })

  it('should have transformed algolia hits into videos', () => {
    const transformedItems = transformItems(algoliaVideos)
    expect(transformedItems).toEqual(transformedVideos)
  })

  it('should return hits', async () => {
    const { result } = renderHook(() => useAlgoliaVideos())
    await expect(result.current.hits).toEqual([...transformedVideos])
  })

  it('should return showMore', () => {
    const { result } = renderHook(() => useAlgoliaVideos())
    expect(result.current.showMore).toBeDefined()
  })

  it('should return isLastPage', () => {
    const { result } = renderHook(() => useAlgoliaVideos())
    expect(result.current.isLastPage).toBe(false)
  })

  it('should not refine languageId to english if there is already a selected language', () => {
    const refine = jest.fn()
    mockUseRouter.mockReturnValue({
      asPath: '/watch/videos?languages=1'
    } as unknown as NextRouter)
    mockUseRefinementList.mockReturnValue({
      items: [
        {
          count: 100,
          isRefined: false,
          value: '529',
          label: '529',
          highlighted: '529'
        },
        {
          count: 100,
          isRefined: true,
          value: '1',
          label: '1',
          highlighted: '1'
        }
      ],
      refine
    } as unknown as RefinementListRenderState)

    renderHook(() => useAlgoliaVideos())

    expect(refine).not.toHaveBeenCalled()
  })
})
