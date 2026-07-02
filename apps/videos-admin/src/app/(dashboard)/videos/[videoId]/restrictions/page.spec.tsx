import Box from '@mui/material/Box'
import { render, screen } from '@testing-library/react'

import VideoRestrictionsPage from './page'

const mockState = vi.hoisted(() => ({
  restrictTranslationsError: null as Error | null
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' })
}))

vi.mock('../_RestrictTranslations', () => ({
  RestrictTranslations: ({ videoId }: { videoId: string }) => {
    if (mockState.restrictTranslationsError != null) {
      throw mockState.restrictTranslationsError
    }

    return <Box data-testid="restrict-translations">{videoId}</Box>
  }
}))

vi.mock('../_RestrictedViews', () => ({
  RestrictedViews: ({ videoId }: { videoId: string }) => (
    <Box data-testid="restricted-views">{videoId}</Box>
  )
}))

vi.mock('../_RestrictedDownloads', () => ({
  RestrictedDownloads: ({ videoId }: { videoId: string }) => (
    <Box data-testid="restricted-downloads">{videoId}</Box>
  )
}))

describe('VideoRestrictionsPage', () => {
  beforeEach(() => {
    mockState.restrictTranslationsError = null
  })

  it('renders translation, view, and download restrictions', () => {
    render(<VideoRestrictionsPage />)

    expect(screen.getByText('Translations')).toBeInTheDocument()
    expect(screen.getByText('Restricted Views')).toBeInTheDocument()
    expect(screen.getByText('Restricted Downloads')).toBeInTheDocument()
    expect(screen.getByTestId('restrict-translations')).toHaveTextContent(
      'video123'
    )
    expect(screen.getByTestId('restricted-views')).toHaveTextContent('video123')
    expect(screen.getByTestId('restricted-downloads')).toHaveTextContent(
      'video123'
    )
  })

  it('shows a restrictions load error when translation restrictions fail to load', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    mockState.restrictTranslationsError = new Error(
      'Cannot query field "restrictTranslations" on type "Video".'
    )

    render(<VideoRestrictionsPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load restrictions'
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The video exists, but restriction settings could not be loaded.'
    )
    expect(screen.queryByText('Video not found')).not.toBeInTheDocument()
    expect(screen.getByTestId('restricted-views')).toHaveTextContent('video123')
    expect(screen.getByTestId('restricted-downloads')).toHaveTextContent(
      'video123'
    )

    consoleError.mockRestore()
  })
})
