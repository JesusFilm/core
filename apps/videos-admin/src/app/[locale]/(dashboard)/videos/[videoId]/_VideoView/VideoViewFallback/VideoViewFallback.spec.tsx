import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { VideoViewFallback } from './VideoViewFallback'

const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack
  })
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
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument()
  })

  it('should go back when button is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <VideoViewFallback />
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Go Back' }))

    expect(mockBack).toHaveBeenCalled()
  })
})
