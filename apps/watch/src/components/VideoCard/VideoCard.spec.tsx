import { render } from '@testing-library/react'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { type CoreVideo } from '../../libs/algolia/transformAlgoliaVideos'
import { videos } from '../Videos/__generated__/testData'

import { VideoCard } from '.'

jest.mock('react-instantsearch')
jest.mock('@core/journeys/ui/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideoCard', () => {
  const transformedVideos = [
    {
      __typename: 'Video',
      childrenCount: 49,
      id: 'videoId',
      images: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh:
            'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_GOJ-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
        }
      ],
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
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: transformedVideos,
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })
  })

  describe('video contained', () => {
    it('displays image', () => {
      const { getByRole } = render(
        <VideoCard video={videos[0]} variant="contained" />
      )
      const img = getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        videos[0].images[0].mobileCinematicHigh
      )
      expect(img).toHaveAttribute('alt', videos[0].title[0].value)
    })

    it('sets link to video url', () => {
      const { getByRole } = render(
        <VideoCard video={videos[0]} variant="contained" />
      )
      const [videoId, languageId] = (videos[0].variant?.slug as string).split(
        '/'
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/watch/${videoId}.html/${languageId}.html`
      )
    })

    it('sets link to video url with container slug', () => {
      const { getByRole } = render(
        <VideoCard
          video={videos[0]}
          variant="contained"
          containerSlug="container"
        />
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/watch/container.html/${videos[0].variant?.slug as string}.html`
      )
    })

    it('sets link to video url without container slug when collection', () => {
      const { getByRole } = render(
        <VideoCard
          video={videos[9]}
          variant="contained"
          containerSlug="jesus"
        />
      )
      const [videoId, languageId] = (videos[9].variant?.slug as string).split(
        '/'
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/watch/${videoId}.html/${languageId}.html`
      )
    })

    it('sets link to video url without container slug when series', () => {
      const { getByRole } = render(
        <VideoCard
          video={videos[5]}
          variant="contained"
          containerSlug="jesus"
        />
      )
      const [videoId, languageId] = (videos[5].variant?.slug as string).split(
        '/'
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/watch/${videoId}.html/${languageId}.html`
      )
    })

    it('displays feature film', () => {
      const { getByText } = render(
        <VideoCard video={videos[0]} variant="contained" />
      )
      expect(getByText('JESUS')).toBeInTheDocument()
      expect(getByText('Feature Film')).toHaveStyle('color: #FF9E00')
      expect(getByText('61 chapters')).toBeInTheDocument()
    })

    it('displays segment', () => {
      const { getByText } = render(
        <VideoCard video={videos[2]} variant="contained" />
      )
      expect(getByText('Jesus Calms the Storm')).toBeInTheDocument()
      expect(getByText('Chapter')).toHaveStyle('color: #7283BE')
      expect(getByText('1:59')).toBeInTheDocument()
    })

    it('displays series', () => {
      const { getByText } = render(
        <VideoCard video={videos[5]} variant="contained" />
      )
      expect(getByText('Reflections of Hope')).toBeInTheDocument()
      expect(getByText('Series')).toHaveStyle('color: #3AA74A')
      expect(getByText('7 episodes')).toBeInTheDocument()
    })

    it('displays episode', () => {
      const { getByText } = render(
        <VideoCard video={videos[6]} variant="contained" />
      )
      expect(getByText('Day 6: Jesus Died for Me')).toBeInTheDocument()
      expect(getByText('Episode')).toHaveStyle('color: #7283BE')
      expect(getByText('8:08')).toBeInTheDocument()
    })

    it('displays collection', () => {
      const { getByText } = render(
        <VideoCard video={videos[9]} variant="contained" />
      )
      expect(getByText('LUMO')).toBeInTheDocument()
      expect(getByText('Collection')).toHaveStyle('color: #FF9E00')
      expect(getByText('5 items')).toBeInTheDocument()
    })

    it('displays short film', () => {
      const { getByText } = render(
        <VideoCard video={videos[12]} variant="contained" />
      )
      expect(getByText('Chosen Witness')).toBeInTheDocument()
      expect(getByText('Short Film')).toHaveStyle('color: #FF9E00')
      expect(getByText('9:25')).toBeInTheDocument()
    })

    it('displays playing now', () => {
      const { getByText } = render(
        <VideoCard video={videos[0]} variant="contained" active />
      )
      expect(getByText('Playing now')).toBeInTheDocument()
    })
  })

  describe('video expanded', () => {
    it('shows episode with count', () => {
      const { getByText } = render(
        <VideoCard video={videos[6]} variant="expanded" index={0} />
      )
      expect(getByText('Episode 1')).toBeInTheDocument()
    })

    it('shows segment with count', () => {
      const { getByText } = render(
        <VideoCard video={videos[2]} variant="expanded" index={0} />
      )
      expect(getByText('Chapter 1')).toBeInTheDocument()
    })

    it('shows title', () => {
      const { getByText } = render(
        <VideoCard video={videos[0]} variant="expanded" index={0} />
      )
      expect(getByText('JESUS')).toBeInTheDocument()
    })
  })

  describe('no video', () => {
    it('displays placeholders when contained', async () => {
      const { getByTestId, queryByTestId } = render(
        <VideoCard variant="contained" />
      )
      expect(getByTestId('VideoImageSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoTitleSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoLabelSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoVariantDurationSkeleton')).toBeInTheDocument()
      expect(queryByTestId('VideoLabelIndexSkeleton')).not.toBeInTheDocument()
    })

    it('displays placeholders when expanded', async () => {
      const { getByTestId, queryByTestId } = render(
        <VideoCard variant="expanded" />
      )
      expect(getByTestId('VideoImageSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoTitleSkeleton')).toBeInTheDocument()
      expect(queryByTestId('VideoLabelSkeleton')).not.toBeInTheDocument()
      expect(getByTestId('VideoVariantDurationSkeleton')).toBeInTheDocument()
      expect(queryByTestId('VideoLabelIndexSkeleton')).not.toBeInTheDocument()
    })

    it('should display placeholder when expanded with index', async () => {
      const { getByTestId } = render(<VideoCard variant="expanded" index={0} />)
      expect(getByTestId('VideoLabelIndexSkeleton')).toBeInTheDocument()
    })

    it('should set link pointer-events to none', async () => {
      const { getByRole } = render(<VideoCard variant="contained" />)
      expect(getByRole('link')).toHaveStyle('pointer-events: none')
    })
  })
})
