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
      expect(getAllByAltText('The Beginning')[0]).toBeInTheDocument()
    })
  })
  it('should have onClick called', async () => {
    const { getByText } = render(
      <MockedProvider>
        <CarouselItem
          title={[{ __typename: 'Translation', value: 'The Beginning' }]}
          image="https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg"
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
      fireEvent.click(getByText('Play Now'))
      expect(onClick).toHaveBeenCalled()
    })
  })
})
