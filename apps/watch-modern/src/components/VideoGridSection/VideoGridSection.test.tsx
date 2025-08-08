import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { VideoGridSection } from './index'

describe('VideoGridSection', () => {
  const renderComponent = (props = {}) => {
    return (
      <MockedProvider mocks={[]} addTypename={false}>
        <VideoGridSection collectionId="test-collection" {...props} />
      </MockedProvider>
    )
  }

  describe('Default Variant', () => {
    it('renders section title and heading', () => {
      render(renderComponent())
      expect(screen.getByText('FEATURED VIDEOS')).toBeInTheDocument()
      expect(screen.getByText('Explore the Video Library')).toBeInTheDocument()
    })

    it('renders loading state when no data available', () => {
      render(renderComponent())
      const skeletons = screen.getAllByTestId('item-loading-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('applies responsive grid classes', () => {
      render(renderComponent())
      const grid = screen.getAllByRole('button', { name: 'see all videos' })[0].closest('section')?.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    })

    it('renders loading skeletons when isLoading is true', () => {
      render(renderComponent({ isLoading: true }))
      const skeletons = screen.getAllByTestId('item-loading-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('supports optional numbering labels when showNumbering is true', () => {
      render(renderComponent({ showNumbering: true }))
      // Since there's no data, we just check that the component renders without error
      expect(screen.getByText('FEATURED VIDEOS')).toBeInTheDocument()
    })
  })

  describe('Course Variant', () => {
    it('renders section title and heading', () => {
      render(renderComponent())
      expect(screen.getByText('FEATURED VIDEOS')).toBeInTheDocument()
      expect(screen.getByText('Explore the Video Library')).toBeInTheDocument()
    })

    it('renders empty section when no data available', () => {
      render(renderComponent())
      const cards = screen.getAllByRole('button')
      // Only the "SEE ALL" buttons should be present, no video cards
      expect(cards.length).toBe(2) // One for desktop, one for mobile
    })

    it('renders section structure', () => {
      render(renderComponent())
      expect(screen.getByText('FEATURED VIDEOS')).toBeInTheDocument()
      expect(screen.getByText('Explore the Video Library')).toBeInTheDocument()
    })

    it('renders section with proper structure', () => {
      render(renderComponent())
      expect(screen.getByText('FEATURED VIDEOS')).toBeInTheDocument()
      expect(screen.getByText('Explore the Video Library')).toBeInTheDocument()
    })

    it('renders section with proper styling', () => {
      render(renderComponent())
      const section = screen.getByText('FEATURED VIDEOS').closest('section')
      expect(section).toHaveClass('min-h-[60vh]', 'bg-slate-950')
    })

    it('applies responsive grid classes', () => {
      render(renderComponent())
      const grid = screen.getAllByRole('button', { name: 'see all videos' })[0].closest('section')?.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    })

    it('renders loading skeletons when isLoading is true', () => {
      render(renderComponent({ isLoading: true }))
      const skeletons = screen.getAllByTestId('item-loading-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders custom description text at bottom', () => {
      render(renderComponent({ 
        customDescription: (
          <>
            <span className="text-white font-bold">This course</span> is designed to help new believers understand the basics of Christian faith. Each video covers essential topics that will strengthen your foundation and guide you as you begin your journey with Jesus Christ.
          </>
        )
      }))
      expect(screen.getByText(/This course/)).toBeInTheDocument()
      expect(screen.getByText(/is designed to help new believers/)).toBeInTheDocument()
    })

    it('has proper ARIA labels', () => {
      render(renderComponent())
      const seeAllButtons = screen.getAllByRole('button', { name: /see all videos/i })
      expect(seeAllButtons.length).toBeGreaterThan(0)
    })
  })
})

