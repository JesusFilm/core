import { render } from '@testing-library/react'
import {
  VideoContentFields,
  VideoContentFields_variant as Variant
} from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { VideoContentCarousel } from '.'

const variantProps: Pick<Variant, 'downloads' | 'language'> = {
  downloads: [],
  language: {
    __typename: 'Language',
    id: '529',
    name: [{ __typename: 'Translation', value: 'English' }]
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

describe('VideoContentCarousel', () => {
  it('should display video title and icon buttons when playing', () => {
    const { getByRole } = render(
      <VideoProvider value={{ content: shortFilm }}>
        <VideoContentCarousel playing />
      </VideoProvider>
    )

    expect(getByRole('heading', { level: 5 })).toHaveTextContent(
      shortFilm.title[0].value
    )
    // TODO: Add icon buttons
  })

  describe('content without container', () => {
    it('should display all children videos if present', () => {
      // Children usually present on feature film
      // Series and Collections which have children render on VideoContainerPage
      const { getAllByRole } = render(
        <VideoProvider value={{ content: featureFilm }}>
          <VideoContentCarousel />
        </VideoProvider>
      )

      const relatedVideos = getAllByRole('link')

      expect(relatedVideos).toHaveLength(featureFilm.children.length)
      expect(relatedVideos[0]).toHaveAttribute(
        'href',
        `/jesus/the-beginning/english`
      )
      expect(getAllByRole('button')[0]).toHaveAccessibleName(
        'The Beginning 8:08'
      )
    })
  })

  describe('content in container', () => {
    it('should display all sibling videos if content video has no children', () => {
      const { getAllByRole, getAllByTestId } = render(
        <VideoProvider
          value={{
            content: collection.children[0],
            container: collection
          }}
        >
          <VideoContentCarousel />
        </VideoProvider>
      )

      const relatedVideos = getAllByTestId('VideoCard')

      expect(relatedVideos).toHaveLength(collection.children.length)
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

      const { getAllByRole, getAllByTestId } = render(
        <VideoProvider
          value={{
            content: shortFilm,
            container
          }}
        >
          <VideoContentCarousel />
        </VideoProvider>
      )

      const relatedVideos = getAllByTestId('VideoCard')

      expect(relatedVideos).toHaveLength(series.children.length + 1 + 1)

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
          <VideoContentCarousel />
        </VideoProvider>
      )

      expect(getByTestId('container-title')).toHaveTextContent(
        'JESUS • chapters 1 of 61'
      )
      expect(getByTestId('container-progress')).toHaveTextContent('1/61')
      expect(getByRole('link', { name: 'Watch full film' })).toBeInTheDocument()
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
          <VideoContentCarousel />
        </VideoProvider>
      )

      expect(getByTestId('container-title')).toHaveTextContent(
        'Reflections of Hope • episodes 2 of 7'
      )
      expect(getByTestId('container-progress')).toHaveTextContent('2/7')
      expect(getByRole('link', { name: 'See all' })).toBeInTheDocument()
    })

    it('should display container labels and button for item in collection', () => {
      const { getByTestId, getByRole } = render(
        <VideoProvider
          value={{
            content: collection.children[0],
            container: collection
          }}
        >
          <VideoContentCarousel />
        </VideoProvider>
      )

      expect(getByTestId('container-title')).toHaveTextContent(
        'LUMO - The Gospel of Luke • 26 items'
      )
      expect(getByTestId('container-progress')).toHaveTextContent('1/26')
      expect(getByRole('link', { name: 'See all' })).toBeInTheDocument()
    })
  })
})
