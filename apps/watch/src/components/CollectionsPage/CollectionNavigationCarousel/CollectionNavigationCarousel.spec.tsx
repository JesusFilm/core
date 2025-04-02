import { fireEvent, render, screen } from '@testing-library/react'

import { CollectionNavigationCarousel } from './CollectionNavigationCarousel'

const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView
const scrollIntoViewMock = jest.fn()

// Mock content items for testing
const mockContentItems = [
  {
    contentId: 'easter-explained',
    title: 'Easter Explained',
    category: 'Holiday',
    image: '/images/easter.jpg',
    bgColor: '#f3f4f6'
  },
  {
    contentId: 'my-last-day',
    title: 'My Last Day',
    category: 'Story',
    image: '/images/last-day.jpg',
    bgColor: '#e5e7eb'
  },
  {
    contentId: 'why-did-jesus-have-to-die',
    title: 'Why Did Jesus Have to Die',
    category: 'Teaching',
    image: '/images/teaching.jpg',
    bgColor: '#d1d5db'
  },
  {
    contentId: 'john-316',
    title: 'John 3:16',
    category: 'Scripture',
    image: '/images/john.jpg',
    bgColor: '#9ca3af'
  },
  {
    contentId: 'resurrection',
    title: 'The Resurrection',
    category: 'Story',
    image: '/images/resurrection.jpg',
    bgColor: '#6b7280'
  },
  {
    contentId: 'ascension',
    title: 'The Ascension',
    category: 'Story',
    image: '/images/ascension.jpg',
    bgColor: '#4b5563'
  }
]

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
    render(<CollectionNavigationCarousel contentItems={mockContentItems} />)

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
    render(<CollectionNavigationCarousel contentItems={mockContentItems} />)

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
    render(<CollectionNavigationCarousel contentItems={mockContentItems} />)

    const firstCarouselItem = screen.getByTestId(
      'CarouselItem-easter-explained'
    )
    fireEvent.keyDown(firstCarouselItem, { key: 'Enter' })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
  })

  it('does not scroll on other key presses', () => {
    render(<CollectionNavigationCarousel contentItems={mockContentItems} />)

    const firstCarouselItem = screen.getByTestId(
      'CarouselItem-easter-explained'
    )
    fireEvent.keyDown(firstCarouselItem, { key: 'Space' })

    expect(scrollIntoViewMock).not.toHaveBeenCalled()
  })

  it('renders all carousel items with correct accessibility attributes', () => {
    render(<CollectionNavigationCarousel contentItems={mockContentItems} />)

    const carouselItems = screen.getAllByTestId(/^CarouselItem-/)

    expect(carouselItems.length).toBe(6)

    carouselItems.forEach((item) => {
      expect(item).toHaveAttribute('tabIndex', '0')
      expect(item).toHaveAttribute('role', 'button')
      expect(item).toHaveAttribute('aria-label')
    })
  })
})
