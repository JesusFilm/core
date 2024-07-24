import { fireEvent, render, screen } from '@testing-library/react'
import { useAlgoliaVideos } from '../../libs/algolia/useAlgoliaVideos'
import type { AlgoliaVideos } from '../../libs/algolia/useAlgoliaVideos'
import { videos } from '../Videos/__generated__/testData'
import { VideoGrid } from './VideoGrid'

jest.mock('react-instantsearch')
jest.mock('../../libs/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideoGrid', () => {
  const algoliaVideos = [
    {
      videoId: 'videoId',
      title: [
        {
          value: 'title1'
        }
      ],
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
  ] as unknown as AlgoliaVideos[]
  describe('Core Videos', () => {
    it('should render core videos', () => {
      mockedUseAlgoliaVideos.mockReturnValue({
        hits: algoliaVideos,
        showMore: jest.fn(),
        isLastPage: false
      })

      render(<VideoGrid videos={videos} />)

      expect(
        screen.getByRole('heading', { level: 3, name: 'JESUS' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Life of Jesus (Gospel of John)'
        })
      ).toBeInTheDocument()
    })
  })

  describe('Algolia Videos', () => {
    it('should render correct number of videos', async () => {
      mockedUseAlgoliaVideos.mockReturnValue({
        hits: algoliaVideos,
        showMore: jest.fn(),
        isLastPage: false
      })

      render(<VideoGrid />)

      expect(
        screen.getByRole('heading', { level: 3, name: 'title1' })
      ).toBeInTheDocument()
    })

    it('should request most videos', async () => {
      const showMore = jest.fn()
      mockedUseAlgoliaVideos.mockReturnValue({
        hits: algoliaVideos,
        showMore,
        isLastPage: false
      })

      render(<VideoGrid showLoadMore />)
      fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
      expect(showMore).toHaveBeenCalled()
    })

    it('should show load more button', async () => {
      mockedUseAlgoliaVideos.mockReturnValue({
        hits: algoliaVideos,
        showMore: jest.fn(),
        isLastPage: true
      })

      render(<VideoGrid showLoadMore />)

      expect(
        screen.getByRole('button', { name: 'No More Videos' })
      ).toBeInTheDocument()
    })

    it('should if its loading', () => {
      mockedUseAlgoliaVideos.mockReturnValue({
        hits: [],
        showMore: jest.fn(),
        isLastPage: true
      })

      render(<VideoGrid showLoadMore />)

      expect(
        screen.getByRole('button', { name: 'Loading...' })
      ).toBeInTheDocument()
    })
  })
})
