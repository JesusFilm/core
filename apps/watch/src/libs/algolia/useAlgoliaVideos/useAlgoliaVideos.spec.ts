import { renderHook } from '@testing-library/react'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { NextRouter, useRouter } from 'next/router'
import { useInfiniteHits, useRefinementList } from 'react-instantsearch'
import {
  AlgoliaVideo,
  transformItems,
  useAlgoliaVideos
} from './useAlgoliaVideos'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('react-instantsearch')

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
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

  beforeEach(() => {
    mockUseInfiniteHits.mockReturnValue({
      hits: algoliaVideos,
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseRefinementList.mockReturnValue({
      refine: jest.fn()
    } as unknown as RefinementListRenderState)

    mockUseRouter.mockReturnValue({
      asPath: '/watch'
    } as unknown as NextRouter)
  })

  it('should have transformed algolia hits into videos', () => {
    if (transformItems) {
      const transformedItems = transformItems(algoliaVideos, {})
      expect(transformedItems).toEqual([
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
      ])
    }
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

  it('should refine languageId to english there is no selected language', () => {
    const refine = jest.fn()
    mockUseRouter.mockReturnValue({
      asPath: '/watch'
    } as unknown as NextRouter)
    mockUseRefinementList.mockReturnValue({
      refine
    } as unknown as RefinementListRenderState)

    renderHook(() => useAlgoliaVideos())

    expect(refine).toHaveBeenCalledWith('529')
  })

  it('should not refine languageId to english if there is already a selected language', () => {
    const refine = jest.fn()
    mockUseRouter.mockReturnValue({
      asPath: '/watch/videos?languages=1'
    } as unknown as NextRouter)
    mockUseRefinementList.mockReturnValue({
      refine
    } as unknown as RefinementListRenderState)

    renderHook(() => useAlgoliaVideos())

    expect(refine).not.toHaveBeenCalled()
  })
})
