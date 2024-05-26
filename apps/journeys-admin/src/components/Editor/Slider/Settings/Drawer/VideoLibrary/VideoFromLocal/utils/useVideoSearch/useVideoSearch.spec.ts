import { act, renderHook, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../../../../../../../__generated__/globalTypes'
import { transformAlgoliaVideos } from '../transformAlgoliaVideos/transformAlgoliaVideos'

import { useVideoSearch } from './useVideoSearch'

jest.mock('algoliasearch', () => {
  return jest.fn().mockReturnValue({
    initIndex: jest.fn().mockReturnValue({
      search: jest.fn().mockResolvedValue({
        hits: [
          {
            languageId: '496',
            subtitles: ['22658', '529', '496'],
            slug: 'the-savior/french',
            titles: ['The Savior'],
            label: 'shortFilm',
            image:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/9_0-The_Savior.mobileCinematicHigh.jpg',
            imageAlt: 'The Savior',
            childrenCount: 0,
            objectID: '9_496-0-TheSavior'
          }
        ],
        page: 0,
        nbPages: 1
      })
    })
  })
})

jest.mock('../transformAlgoliaVideos/transformAlgoliaVideos', () => ({
  transformAlgoliaVideos: jest.fn()
}))

// const transformAlgoliaVideosMock =
//   transformAlgoliaVideos as jest.MockedFunction<typeof transformAlgoliaVideos>

describe('useVideoSearch', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the correct initial values', () => {
    const { result } = renderHook(() => useVideoSearch())

    expect(result.current.isEnd).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.algoliaVideos).toEqual([])
  })

  it('should call search function when a query is provided', async () => {
    const { result } = renderHook(() => useVideoSearch())

    await act(async () => {
      await result.current.handleSearch('test query', 0)
    })
  })
})
