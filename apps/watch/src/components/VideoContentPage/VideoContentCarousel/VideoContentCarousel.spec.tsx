import { fireEvent, render } from '@testing-library/react'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'
import { VideoContentCarousel } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => {
    return { query: { part3: 'english' } }
  }
}))

const collection = videos[13]
const shortFilm = videos[16]
const series = videos[5]
const featureFilm = videos[0]

const onIconClick = { onShareClick: jest.fn(), onDownloadClick: jest.fn() }

describe('VideoContentCarousel', () => {
  it('should display video title when playing on desktop', () => {
    const { getByRole } = render(
      <VideoProvider value={{ content: shortFilm }}>
        <VideoContentCarousel playing {...onIconClick} />
      </VideoProvider>
    )

    expect(getByRole('heading', { level: 5 })).toHaveTextContent(
      shortFilm.title[0].value
    )
  })

  // TODO: unskip when we can configure breakpoints
  xit('should display video title and icon buttons when playing on mobile', () => {
    const { getByRole, getByTestId } = render(
      <VideoProvider value={{ content: shortFilm }}>
        <VideoContentCarousel playing {...onIconClick} />
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
    it('should hide all children videos', () => {
      // Only applies to feature films, series and collections render on VideoContainerPage
      const { queryByTestId } = render(
        <VideoProvider value={{ content: featureFilm }}>
          <VideoContentCarousel {...onIconClick} />
        </VideoProvider>
      )

      expect(queryByTestId('videos-carousel')).not.toBeInTheDocument()
    })
  })

  describe('content in container', () => {
    it('should display all related child and sibling videos', () => {
      const { getAllByRole, getAllByTestId } = render(
        <VideoProvider
          value={{
            content: collection.children[0] as VideoContentFields,
            container: collection
          }}
        >
          <VideoContentCarousel {...onIconClick} />
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

    it('should display container labels and button for segment in feature film', () => {
      const { getByTestId, getByRole } = render(
        <VideoProvider
          value={{
            content: featureFilm.children[0] as VideoContentFields,
            container: featureFilm
          }}
        >
          <VideoContentCarousel {...onIconClick} />
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
            content: series.children[1] as VideoContentFields,
            container: series
          }}
        >
          <VideoContentCarousel {...onIconClick} />
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
            content: collection.children[0] as VideoContentFields,
            container: collection
          }}
        >
          <VideoContentCarousel {...onIconClick} />
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
