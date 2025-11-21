import { render, screen } from '@testing-library/react'

import { OtherCollectionsCarousel } from './OtherCollectionsCarousel'

describe('OtherCollectionsCarousel', () => {
  const mockMovieUrls = [
    {
      imageUrl: 'https://example.com/movie1.jpg',
      altText: 'Movie 1',
      externalUrl: 'https://www.jesusfilm.org/movie1'
    },
    {
      imageUrl: 'https://example.com/movie2.jpg',
      altText: 'Movie 2',
      externalUrl: 'https://www.jesusfilm.org/movie2'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <OtherCollectionsCarousel
        id="test-id"
        collectionSubtitle="Video Bible Collection"
        collectionTitle="The Easter story is a key part of a bigger picture"
        watchButtonText="Watch"
        missionDescription="The Easter story is a key part of a bigger picture"
        missionHighlight="The Easter story"
        movieUrls={[]}
      />
    )
    const carousel = screen.getByTestId('OtherCollectionsCarousel')
    expect(carousel).toBeInTheDocument()
  })

  it('displays collection titles correctly', () => {
    render(
      <OtherCollectionsCarousel
        id="test-id"
        collectionSubtitle="Video Bible Collection"
        collectionTitle="The Easter story is a key part of a bigger picture"
        watchButtonText="Watch"
        missionDescription="The Easter story is a key part of a bigger picture"
        missionHighlight="The Easter story"
        movieUrls={[]}
      />
    )

    const subtitle = screen.getByTestId('CollectionSubtitle')
    const title = screen.getByTestId('CollectionTitle')

    expect(subtitle).toBeInTheDocument()
    expect(subtitle).toHaveTextContent('Video Bible Collection')

    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent(
      'The Easter story is a key part of a bigger picture'
    )
  })

  it('renders the swiper component', () => {
    render(
      <OtherCollectionsCarousel
        id="test-id"
        collectionSubtitle="Video Bible Collection"
        collectionTitle="The Easter story is a key part of a bigger picture"
        watchButtonText="Watch"
        missionDescription="The Easter story is a key part of a bigger picture"
        missionHighlight="The Easter story"
        movieUrls={[]}
      />
    )

    const swiperElement = screen.getByTestId('VideoSwiper')
    expect(swiperElement).toBeInTheDocument()
  })

  it('has the correct link for the watch button', () => {
    render(
      <OtherCollectionsCarousel
        id="test-id"
        collectionSubtitle="Video Bible Collection"
        collectionTitle="The Easter story is a key part of a bigger picture"
        watchButtonText="Watch"
        missionDescription="The Easter story is a key part of a bigger picture"
        missionHighlight="The Easter story"
        movieUrls={[]}
      />
    )

    const watchButton = screen.getByTestId('WatchButton')
    expect(watchButton).toBeInTheDocument()

    // Get the parent anchor element
    const anchor = watchButton.closest('a')
    expect(anchor).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/watch?utm_source=jesusfilm-watch'
    )
    expect(anchor).toHaveAttribute('target', '_blank')
  })

  it('renders movie slides with correct links and images', () => {
    render(
      <OtherCollectionsCarousel
        id="test-id"
        collectionSubtitle="Video Bible Collection"
        collectionTitle="The Easter story is a key part of a bigger picture"
        watchButtonText="Watch"
        missionDescription="The Easter story is a key part of a bigger picture"
        missionHighlight="The Easter story"
        movieUrls={mockMovieUrls}
      />
    )

    // Check if the movie slides are rendered correctly
    for (let i = 0; i < mockMovieUrls.length; i++) {
      const slideElement = screen.getByTestId(`VideoSlide_${i}`)
      expect(slideElement).toBeInTheDocument()

      // Check if the anchor has the correct URL
      const anchor = slideElement.querySelector('a')
      expect(anchor).toHaveAttribute('href', mockMovieUrls[i].externalUrl)
      expect(anchor).toHaveAttribute('target', '_blank')

      // Check if the image has the correct source and alt text
      const image = slideElement.querySelector('img')
      expect(image).toHaveAttribute('src', mockMovieUrls[i].imageUrl)
      expect(image).toHaveAttribute('alt', mockMovieUrls[i].altText)
    }
  })
})
