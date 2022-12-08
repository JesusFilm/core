import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { CarouselItem } from './CarouselItem'

const onClick = jest.fn()

describe('carouselItem', () => {
  it('should have correct alt text', async () => {
    const { getAllByAltText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="segment"
          isPlaying
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getAllByAltText('JESUS')[0]).toBeInTheDocument()
    })
  })
  it('should have onClick called', async () => {
    const { getByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="segment"
          isPlaying={false}
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      fireEvent.click(getByText('Play Now'))
      expect(onClick).toHaveBeenCalled()
    })
  })
  it('should display chapter label for segement', async () => {
    const { getByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="segment"
          isPlaying
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('Chapter 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for collection', async () => {
    const { getByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="collection"
          isPlaying
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for episode', async () => {
    const { getByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="episode"
          isPlaying
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for series', async () => {
    const { getByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="series"
          isPlaying
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should not display episode or chapter label for featureFilm', async () => {
    const { queryByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="featureFilm"
          isPlaying
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(queryByText('Episode 4')).not.toBeInTheDocument()
      expect(queryByText('Chapter 4')).not.toBeInTheDocument()
    })
  })
  it('should not display episode or chapter label for shortFilm', async () => {
    const { queryByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
          imageAlt={[{ __typename: 'Translation', value: 'JESUS' }]}
          variant={{
            __typename: 'VideoVariant',
            id: '1_529-jf6101-0-0',
            duration: 488,
            hls: 'https://arc.gt/pm6g1',
            slug: 'the-beginning/english'
          }}
          index={4}
          label="shortFilm"
          isPlaying
          onClick={onClick}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(queryByText('Episode 4')).not.toBeInTheDocument()
      expect(queryByText('Chapter 4')).not.toBeInTheDocument()
    })
  })
})
