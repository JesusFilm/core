import { fireEvent, render } from '@testing-library/react'
import {
  VideoContentFields,
  VideoContentFields_variant as Variant
} from '../../../../__generated__/VideoContentFields'
import { GetVideoChildren_video_children as VideoSibling } from '../../../../__generated__/GetVideoChildren'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { VideoContentCarousel } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => {
    return { query: { part3: 'english' } }
  }
}))

const variantProps: Pick<Variant, 'downloads' | 'language'> = {
  downloads: [],
  language: {
    __typename: 'Language',

    id: '529',
    name: [{ __typename: 'Translation', value: 'English', primary: true }]
  }
}

const getChildVideos = (videoIndex: number): VideoContentFields[] => {
  const firstChildProps = videos[videoIndex].children[0] as VideoContentFields
  const childVariantProps =
    firstChildProps != null
      ? (firstChildProps.variant as Variant)
      : (videos[videoIndex].variant as Variant)

  return [
    {
      ...firstChildProps,
      description: [
        {
          __typename: 'Translation',
          value: ''
        }
      ],
      studyQuestions: [],
      variant: {
        ...childVariantProps,
        ...variantProps
      }
    },
    ...(videos[videoIndex].children.slice(1) as VideoContentFields[])
  ]
}

const collection = {
  ...videos[13],
  children: getChildVideos(13)
}

const shortFilm: VideoContentFields = {
  ...videos[18],
  children: getChildVideos(18)
}

const series: VideoContentFields = { ...videos[5], children: getChildVideos(5) }

const featureFilm: VideoContentFields = videos[0]

const onIconClick = { onShareClick: jest.fn(), onDownloadClick: jest.fn() }

describe('VideoContentCarousel', () => {
  it('should display video title when playing on desktop', () => {
    const videoChildren: VideoSibling[] = []

    const { getByRole } = render(
      <VideoProvider value={{ content: shortFilm }}>
        <VideoContentCarousel
          videoChildren={videoChildren}
          playing
          {...onIconClick}
        />
      </VideoProvider>
    )

    expect(getByRole('heading', { level: 5 })).toHaveTextContent(
      shortFilm.title[0].value
    )
  })

  // TODO: unskip when we can configure breakpoints
  xit('should display video title and icon buttons when playing on mobile', () => {
    const videoChildren: VideoSibling[] = []

    const { getByRole, getByTestId } = render(
      <VideoProvider value={{ content: shortFilm }}>
        <VideoContentCarousel
          videoChildren={videoChildren}
          playing
          {...onIconClick}
        />
      </VideoProvider>
    )

    expect(getByRole('heading', { level: 5 })).toHaveTextContent(
      shortFilm.title[0].value
    )
    fireEvent.click(getByTestId('share'))
    expect(onIconClick.onShareClick).toHaveBeenCalled()
    fireEvent.click(getByTestId('download'))
    expect(onIconClick.onDownloadClick).toHaveBeenCalled()
  })
  describe('content without container', () => {
    it('should hide all children videos if present', () => {
      // Children usually present on feature film
      // Series and Collections which have children render on VideoContainerPage
      const videoChildren: VideoSibling[] = [
        { id: '1' } as unknown as VideoSibling
      ]

      const { queryByTestId } = render(
        <VideoProvider value={{ content: featureFilm }}>
          <VideoContentCarousel
            videoChildren={videoChildren}
            {...onIconClick}
          />
        </VideoProvider>
      )

      expect(queryByTestId('videos-carousel')).not.toBeInTheDocument()
    })
  })

  describe('content in container', () => {
    it('should display all sibling videos if content video has no children', () => {
      const videoChildren: VideoSibling[] = collection.children.map((video) => {
        return {
          __typename: video.__typename,
          id: video.id,
          label: video.label,
          title: video.title,
          image: video.image,
          imageAlt: video.imageAlt,
          snippet: video.snippet,
          slug: video.slug,
          children: video.children,
          variant: video.variant,
          childrenCount: video.childrenCount
        }
      })

      const { getAllByRole, getAllByTestId } = render(
        <VideoProvider
          value={{
            content: collection.children[0],
            container: collection
          }}
        >
          <VideoContentCarousel
            videoChildren={videoChildren}
            {...onIconClick}
          />
        </VideoProvider>
      )

      const relatedVideos = getAllByTestId('VideoCard')

      expect(relatedVideos).toHaveLength(collection.childrenCount)
      expect(relatedVideos[0]).toHaveAttribute(
        'href',
        `/lumo-the-gospel-of-luke/lumo-luke-1-1-56/english`
      )
      expect(getAllByRole('button')[0]).toHaveAccessibleName(
        'LUMO - Luke 1:1-56 Playing now'
      )
    })

    it('should display unique siblings after child videos if children present on content video', () => {
      const container = {
        ...series,
        children: [...series.children, shortFilm, shortFilm.children[0]]
      }

      const videoChildren: VideoSibling[] = shortFilm.children.map((video) => {
        return {
          __typename: video.__typename,
          id: video.id,
          label: video.label,
          title: video.title,
          image: video.image,
          imageAlt: video.imageAlt,
          snippet: video.snippet,
          slug: video.slug,
          children: video.children,
          variant: video.variant,
          childrenCount: video.childrenCount
        }
      })

      const { getAllByRole, getAllByTestId } = render(
        <VideoProvider
          value={{
            content: shortFilm,
            container
          }}
        >
          <VideoContentCarousel
            videoChildren={videoChildren}
            {...onIconClick}
          />
        </VideoProvider>
      )

      const relatedVideos = getAllByTestId('VideoCard')

      expect(relatedVideos).toHaveLength(series.childrenCount + 1 + 1)

      expect(relatedVideos[0]).toHaveAttribute(
        'href',
        `/reflections-of-hope/my-last-day-trailer/english`
      )
      expect(getAllByRole('button')[0]).toHaveAccessibleName(
        'My Last Day - Trailer 2:04'
      )

      expect(relatedVideos[1]).toHaveAttribute(
        'href',
        `/reflections-of-hope/1-jesus-our-loving-pursuer/english`
      )
      expect(relatedVideos[7]).toHaveAttribute(
        'href',
        `/reflections-of-hope/7-jesus-our-living-water/english`
      )
      expect(relatedVideos[8]).toHaveAttribute(
        'href',
        `/reflections-of-hope/my-last-day/english`
      )
    })

    it('should display container labels and button for segment in feature film', () => {
      const { getByTestId, getByRole } = render(
        <VideoProvider value={{ content: videos[19], container: featureFilm }}>
          <VideoContentCarousel videoChildren={[]} {...onIconClick} />
        </VideoProvider>
      )

      expect(getByRole('link', { name: 'JESUS' })).toHaveAttribute(
        'href',
        `/jesus/english`
      )
      expect(getByTestId('container-progress')).toHaveTextContent(
        'Chapter 1 of 61'
      )
      expect(getByTestId('container-progress-short')).toHaveTextContent('1/61')
      expect(getByRole('link', { name: 'Watch full film' })).toHaveAttribute(
        'href',
        `/jesus/english`
      )
    })

    it('should display container labels and button for episode in series', () => {
      const { getByTestId, getByRole } = render(
        <VideoProvider
          value={{
            content: {
              ...(series.children[1] as VideoContentFields),
              description: [
                {
                  __typename: 'Translation',
                  value: series.children[1].snippet[0].value
                }
              ],
              studyQuestions: [],
              variant: {
                ...(series.children[1].variant as Variant),
                ...variantProps
              }
            },
            container: series
          }}
        >
          <VideoContentCarousel videoChildren={[]} {...onIconClick} />
        </VideoProvider>
      )

      expect(
        getByRole('link', { name: 'Reflections of Hope' })
      ).toHaveAttribute('href', `/reflections-of-hope/english`)
      expect(getByTestId('container-progress')).toHaveTextContent(
        'Episode 2 of 7'
      )
      expect(getByTestId('container-progress-short')).toHaveTextContent('2/7')
      expect(getByRole('link', { name: 'See all' })).toHaveAttribute(
        'href',
        `/reflections-of-hope/english`
      )
    })

    it('should display container labels and button for item in collection', () => {
      const { getByTestId, getByRole } = render(
        <VideoProvider
          value={{
            content: collection.children[0],
            container: collection
          }}
        >
          <VideoContentCarousel videoChildren={[]} {...onIconClick} />
        </VideoProvider>
      )

      expect(
        getByRole('link', { name: 'LUMO - The Gospel of Luke' })
      ).toHaveAttribute('href', `/lumo-the-gospel-of-luke/english`)
      expect(getByTestId('container-progress')).toHaveTextContent('26 items')
      expect(getByTestId('container-progress-short')).toHaveTextContent('1/26')
      expect(getByRole('link', { name: 'See all' })).toHaveAttribute(
        'href',
        `/lumo-the-gospel-of-luke/english`
      )
    })
  })
})
