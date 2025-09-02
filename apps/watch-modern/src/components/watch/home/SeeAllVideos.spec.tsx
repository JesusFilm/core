import { render, screen } from '@testing-library/react'

import { SeeAllVideos } from './SeeAllVideos'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (key === 'ctaSeeAllVideos' ? 'See All Videos' : key)
}))

describe('SeeAllVideos', () => {
  it('renders CTA with label', () => {
    render(<SeeAllVideos />)

    expect(screen.getByRole('link', { name: /see all videos/i })).toBeInTheDocument()
  })
})
