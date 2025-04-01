import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'

import { OtherCollectionsCarousel } from './OtherCollectionsCarousel'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('OtherCollectionsCarousel', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  it('renders without crashing', () => {
    render(<OtherCollectionsCarousel />)
    const carousel = screen.getByTestId('OtherCollectionsCarousel')
    expect(carousel).toBeInTheDocument()
  })

  it('displays collection titles correctly', () => {
    render(<OtherCollectionsCarousel />)

    const subtitle = screen.getByTestId('CollectionSubtitle')
    const title = screen.getByTestId('CollectionTitle')

    expect(subtitle).toBeInTheDocument()
    expect(subtitle).toHaveTextContent('Коллекция Видео Библии')

    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent(
      'История Пасхи - важная часть большой картины'
    )
  })

  it('renders the swiper component', () => {
    render(<OtherCollectionsCarousel />)

    const swiperElement = screen.getByTestId('VideoSwiper')
    expect(swiperElement).toBeInTheDocument()
  })

  it('navigates to the watch page when the watch button is clicked', () => {
    render(<OtherCollectionsCarousel />)

    const watchButton = screen.getByTestId('WatchButton')
    expect(watchButton).toBeInTheDocument()

    fireEvent.click(watchButton)

    expect(mockPush).toHaveBeenCalledWith('/watch')
  })
})
