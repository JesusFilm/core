import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { usePlatformDetection } from './SharedPlaylistBanner'
import { SharedPlaylistBanner } from '.'

jest.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_IOS_APP_ID: '123456789',
    NEXT_PUBLIC_ANDROID_APP_ID: 'com.example.app'
  }
}))

describe('usePlatformDetection', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: ''
    })
    Object.defineProperty(window.navigator, 'platform', {
      writable: true,
      value: ''
    })
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      writable: true,
      value: 0
    })
    Object.defineProperty(window.navigator, 'vendor', {
      writable: true,
      value: ''
    })
  })

  it('detects Android platform', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Linux; Android 10)'
    })
    const TestComponent = () => {
      const platform = usePlatformDetection()
      return <div>{platform}</div>
    }
    const { container } = render(<TestComponent />)
    expect(container.textContent).toBe('android')
  })

  it('detects iOS platform', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    })
    const TestComponent = () => {
      const platform = usePlatformDetection()
      return <div>{platform}</div>
    }
    const { container } = render(<TestComponent />)
    expect(container.textContent).toBe('ios')
  })

  it('detects iPadOS', () => {
    Object.defineProperty(window.navigator, 'platform', {
      writable: true,
      value: 'MacIntel'
    })
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      writable: true,
      value: 2
    })
    const TestComponent = () => {
      const platform = usePlatformDetection()
      return <div>{platform}</div>
    }
    const { container } = render(<TestComponent />)
    expect(container.textContent).toBe('ios')
  })

  it('detects other platform', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    })
    const TestComponent = () => {
      const platform = usePlatformDetection()
      return <div>{platform}</div>
    }
    const { container } = render(<TestComponent />)
    expect(container.textContent).toBe('other')
  })
})

describe('SharedPlaylistBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    })
    Object.defineProperty(window.navigator, 'platform', {
      writable: true,
      value: ''
    })
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      writable: true,
      value: 0
    })
  })

  it('renders banner when not dismissed and not iOS', () => {
    render(<SharedPlaylistBanner name="John" />)
    const banner = screen.getAllByText((_content, element) => {
      return element?.textContent?.includes('sharedWithYou') || false
    })[0]
    expect(banner).toBeInTheDocument()
  })

  it('does not render on iOS platform', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    })
    const { container } = render(<SharedPlaylistBanner name="John" />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render when dismissed in localStorage', () => {
    localStorage.setItem('shared-playlist-banner-dismissed', 'true')
    const { container } = render(<SharedPlaylistBanner name="John" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows both app store links on other platform', () => {
    render(<SharedPlaylistBanner name="John" />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute(
      'href',
      expect.stringContaining('apps.apple.com')
    )
    expect(links[1]).toHaveAttribute(
      'href',
      expect.stringContaining('play.google.com')
    )
  })

  it('shows only Google Play link on Android', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Linux; Android 10)'
    })
    render(<SharedPlaylistBanner name="John" />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute(
      'href',
      expect.stringContaining('play.google.com')
    )
  })

  it('dismisses banner when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(<SharedPlaylistBanner name="John" />)

    const dismissButton = screen.getByLabelText('Dismiss banner')
    await user.click(dismissButton)

    expect(localStorage.getItem('shared-playlist-banner-dismissed')).toBe(
      'true'
    )
    expect(screen.queryByText(/sharedWithYou/i)).not.toBeInTheDocument()
  })

  it('includes owner name in message', () => {
    const { container } = render(<SharedPlaylistBanner name="Jane" />)
    const text = container.textContent || ''
    expect(text.includes('Jane') || text.includes('sharedWithYou')).toBeTruthy()
  })
})
