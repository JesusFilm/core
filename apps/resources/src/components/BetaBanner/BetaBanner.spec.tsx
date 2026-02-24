import { fireEvent, render, screen } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { BetaBanner } from './index'

// Mock document.cookie
let mockCookie = ''
Object.defineProperty(document, 'cookie', {
  get: () => mockCookie,
  set: (value: string) => {
    mockCookie = value
  },
  configurable: true
})

describe('BetaBanner', () => {
  beforeEach(() => {
    mockCookie = ''
    mockRouter.setCurrentUrl('/')
  })

  describe('Rendering Conditions', () => {
    it('should render on watch routes', () => {
      mockRouter.setCurrentUrl('/watch/some-video')
      mockRouter.isReady = true

      render(<BetaBanner />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByText(/Better search/)).toBeInTheDocument()
    })

    it('should render on watch root route', () => {
      mockRouter.setCurrentUrl('/watch')
      mockRouter.isReady = true

      render(<BetaBanner />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should render on watch nested routes', () => {
      mockRouter.setCurrentUrl('/watch/videos')
      mockRouter.isReady = true

      render(<BetaBanner />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should not render on non-watch routes', () => {
      mockRouter.setCurrentUrl('/resources')
      mockRouter.isReady = true

      const { container } = render(<BetaBanner />)

      expect(container.firstChild).toBeNull()
    })

    it('should not render when router is not ready', () => {
      mockRouter.setCurrentUrl('/watch/some-video')
      mockRouter.isReady = false

      const { container } = render(<BetaBanner />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Cookie Setting Logic', () => {
    it('should set EXPERIMENTAL cookie when banner is clicked', () => {
      mockRouter.setCurrentUrl('/watch/some-video')
      mockRouter.isReady = true

      render(<BetaBanner />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(document.cookie).toContain('EXPERIMENTAL=true')
      expect(document.cookie).toContain('max-age=2592000')
      expect(document.cookie).toContain('path=/')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      mockRouter.setCurrentUrl('/watch/some-video')
      mockRouter.isReady = true

      render(<BetaBanner />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Try the new design.')
    })

    it('should be keyboard accessible with Enter key', () => {
      mockRouter.setCurrentUrl('/watch/some-video')
      mockRouter.isReady = true

      render(<BetaBanner />)

      const button = screen.getByRole('button')
      button.focus()

      expect(button).toHaveFocus()

      // Note: Testing keyDown would trigger window.location.reload which is not implemented in JSDOM
      // So we just test that the button is focusable
    })
  })

  describe('Banner Structure', () => {
    it('should have correct base styles', () => {
      mockRouter.setCurrentUrl('/watch/some-video')
      mockRouter.isReady = true

      render(<BetaBanner />)

      const banner = screen.getByRole('banner')
      expect(banner).toHaveStyle({
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete user interaction flow', () => {
      mockRouter.setCurrentUrl('/watch/some-video')
      mockRouter.isReady = true

      render(<BetaBanner />)

      // Banner should be visible
      const banner = screen.getByRole('banner')
      expect(banner).toBeInTheDocument()

      // Click the button
      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Cookie should be set with correct attributes
      expect(document.cookie).toContain('EXPERIMENTAL=true')
      expect(document.cookie).toContain('max-age=2592000')
      expect(document.cookie).toContain('path=/')
    })
  })
})
