import Box from '@mui/material/Box'
import { render, screen } from '@testing-library/react'

import VideoRestrictionsPage from './page'

vi.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' })
}))

vi.mock('../_RestrictTranslations', () => ({
  RestrictTranslations: ({ videoId }: { videoId: string }) => (
    <Box data-testid="restrict-translations">{videoId}</Box>
  )
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
})
