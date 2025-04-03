import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { VideoViewFallback } from './VideoViewFallback'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: () => '/en/videos/123'
}))

describe('VideoViewFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VideoViewFallback />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Video not found')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View Videos' })
    ).toBeInTheDocument()
  })

  it('should go back when button is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <VideoViewFallback />
      </NextIntlClientProvider>
    )

    const link = screen.getByRole('link', { name: 'View Videos' })
    expect(link).toHaveAttribute('href', '/en/videos')
  })
})
