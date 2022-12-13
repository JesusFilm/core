import { fireEvent, render, waitFor } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { CarouselItem } from './CarouselItem'

const onClick = jest.fn()

describe('CarouselItem', () => {
  it('should have correct alt text', async () => {
    const { getAllByAltText } = render(
      <VideoProvider
        value={{
          content: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getAllByAltText('JESUS')[0]).toBeInTheDocument()
    })
  })
  it('should have onClick called', async () => {
    const { getAllByAltText } = render(
      <VideoProvider
        value={{
          content: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      fireEvent.click(getAllByAltText('JESUS')[0])
      expect(onClick).toHaveBeenCalled()
    })
  })
  it('should display chapter label for segment', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: videos[3]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Chapter 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for collection', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: videos[9]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for episode', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: videos[6]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for series', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: videos[5]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should not display episode or chapter label for featureFilm', async () => {
    const { queryByText } = render(
      <VideoProvider
        value={{
          content: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(queryByText('Episode 4')).not.toBeInTheDocument()
      expect(queryByText('Chapter 4')).not.toBeInTheDocument()
    })
  })
  it('should not display episode or chapter label for shortFilm', async () => {
    const { queryByText } = render(
      <VideoProvider
        value={{
          content: videos[12]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(queryByText('Episode 4')).not.toBeInTheDocument()
      expect(queryByText('Chapter 4')).not.toBeInTheDocument()
    })
  })
})
