import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

import { LockedVideoView } from './LockedVideoView'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('LockedVideoView', () => {
  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <LockedVideoView />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Video is locked')).toBeInTheDocument()
    expect(
      screen.getByText('This video is currently locked to prevent edits')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View Videos' })
    ).toBeInTheDocument()
  })

  it('renders the "View Videos" button with correct link', () => {
    const mockPath = '/en/videos/123'
    ;(usePathname as jest.Mock).mockReturnValue(mockPath)

    render(
      <NextIntlClientProvider locale="en">
        <LockedVideoView />
      </NextIntlClientProvider>
    )

    const button = screen.getByRole('button', { name: 'View Videos' })
    const link = button.closest('a')

    expect(button).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/en/videos')
  })
})
