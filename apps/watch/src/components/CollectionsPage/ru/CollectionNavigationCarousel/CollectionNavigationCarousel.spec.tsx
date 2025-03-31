import { fireEvent, render, screen } from '@testing-library/react'

import { CollectionNavigationCarousel } from './CollectionNavigationCarousel'

const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView
const scrollIntoViewMock = jest.fn()

describe('CollectionNavigationCarousel', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock
    scrollIntoViewMock.mockClear()

    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      const div = document.createElement('div')
      div.id = id
      return div
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView
  })

  it('renders the carousel with content items', () => {
    render(<CollectionNavigationCarousel />)

    expect(screen.getByTestId('NavigationCarousel')).toBeInTheDocument()
    expect(
      screen.getByTestId('CarouselItemTitle-easter-explained')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('CarouselItemTitle-my-last-day')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('CarouselItemTitle-why-did-jesus-have-to-die')
    ).toBeInTheDocument()
  })

  it('calls scrollIntoView when a carousel item is clicked', () => {
    render(<CollectionNavigationCarousel />)

    const firstCarouselItem = screen.getByTestId(
      'CarouselItem-easter-explained'
    )
    fireEvent.click(firstCarouselItem)

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('handles keyboard navigation with Enter key', () => {
    render(<CollectionNavigationCarousel />)

    const firstCarouselItem = screen.getByTestId(
      'CarouselItem-easter-explained'
    )
    fireEvent.keyDown(firstCarouselItem, { key: 'Enter' })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
  })

  it('does not scroll on other key presses', () => {
    render(<CollectionNavigationCarousel />)

    const firstCarouselItem = screen.getByTestId(
      'CarouselItem-easter-explained'
    )
    fireEvent.keyDown(firstCarouselItem, { key: 'Space' })

    expect(scrollIntoViewMock).not.toHaveBeenCalled()
  })

  it('renders all carousel items with correct accessibility attributes', () => {
    render(<CollectionNavigationCarousel />)

    const carouselItems = screen.getAllByTestId(/^CarouselItem-/)

    expect(carouselItems.length).toBe(6)

    carouselItems.forEach((item) => {
      expect(item).toHaveAttribute('tabIndex', '0')
      expect(item).toHaveAttribute('role', 'button')
      expect(item).toHaveAttribute('aria-label')
    })
  })
})
