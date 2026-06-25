import { render, screen } from '@testing-library/react'

import VideoRestrictionsPage from './page'

vi.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' })
}))

vi.mock('../_RestrictAutoTranslations', () => ({
  RestrictAutoTranslations: ({ videoId }: { videoId: string }) => (
    <div data-testid="restrict-auto-translations">{videoId}</div>
  )
}))

vi.mock('../_RestrictedViews', () => ({
  RestrictedViews: ({ videoId }: { videoId: string }) => (
    <div data-testid="restricted-views">{videoId}</div>
  )
}))

vi.mock('../_RestrictedDownloads', () => ({
  RestrictedDownloads: ({ videoId }: { videoId: string }) => (
    <div data-testid="restricted-downloads">{videoId}</div>
  )
}))

describe('VideoRestrictionsPage', () => {
  it('renders automatic translation, view, and download restrictions', () => {
    render(<VideoRestrictionsPage />)

    expect(screen.getByText('Automatic Translations')).toBeInTheDocument()
    expect(screen.getByText('Restricted Views')).toBeInTheDocument()
    expect(screen.getByText('Restricted Downloads')).toBeInTheDocument()
    expect(screen.getByTestId('restrict-auto-translations')).toHaveTextContent(
      'video123'
    )
    expect(screen.getByTestId('restricted-views')).toHaveTextContent('video123')
    expect(screen.getByTestId('restricted-downloads')).toHaveTextContent(
      'video123'
    )
  })
})
