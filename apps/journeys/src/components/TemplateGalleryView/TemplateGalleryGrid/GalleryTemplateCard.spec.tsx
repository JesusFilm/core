import { render, screen } from '@testing-library/react'

import { mockTemplate } from '../galleryFixture'

import { GalleryTemplateCard } from './GalleryTemplateCard'

describe('GalleryTemplateCard', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders title, description, language, and image', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)

    expect(screen.getByTestId('GalleryTemplateCard')).toBeInTheDocument()
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(
      screen.getByText('A sample template for testing')
    ).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
    expect(screen.getByAltText('Sample image')).toBeInTheDocument()
  })

  it('renders a labelled Use button that opens the admin deep link in a new tab', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)

    const useButton = screen.getByRole('link', { name: 'Use' })
    expect(useButton).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
    expect(useButton).toHaveAttribute('target', '_blank')
    expect(useButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders Preview as an unlabelled icon button with the Play3 icon that opens the journey slug in a new tab', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)

    const previewIconButton = screen.getByRole('link', { name: 'Preview' })
    expect(previewIconButton).toHaveAttribute('href', '/sample-template')
    expect(previewIconButton).toHaveAttribute('target', '_blank')
    expect(previewIconButton).toHaveAttribute('rel', 'noopener noreferrer')
    expect(previewIconButton).not.toHaveTextContent('Preview')
    expect(
      previewIconButton.querySelector('[data-testid="Play3Icon"]')
    ).not.toBeNull()
  })

  it('renders the meta line with the formatted year and the language', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)
    // mockTemplate.createdAt is '2026-01-01T00:00:00.000Z'. Assert on the
    // year + language with a regex so the test is locale-independent.
    expect(screen.getByText(/2026/)).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
  })

  it('omits the meta line entirely when both date and language are missing', () => {
    render(
      <GalleryTemplateCard
        template={{
          ...mockTemplate,
          createdAt: null,
          language: { ...mockTemplate.language, name: [] }
        }}
      />
    )
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument()
    expect(screen.queryByText(/English/)).not.toBeInTheDocument()
  })

  it('omits the description Typography when description is empty', () => {
    render(
      <GalleryTemplateCard template={{ ...mockTemplate, description: '' }} />
    )
    expect(
      screen.queryByText('A sample template for testing')
    ).not.toBeInTheDocument()
  })

  it('renders a placeholder when there is no primary image', () => {
    render(
      <GalleryTemplateCard
        template={{ ...mockTemplate, primaryImageBlock: null }}
      />
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // The placeholder icon renders inside the inner card Box; assert the
    // outer Stack wrapper (which now also contains the Use/Preview row)
    // still mounts.
    expect(screen.getByTestId('GalleryTemplateCard')).toBeInTheDocument()
  })

  it('uses NEXT_PUBLIC_JOURNEYS_ADMIN_URL as the Use button host when set', () => {
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL = 'https://admin.staging.test'
    render(<GalleryTemplateCard template={mockTemplate} />)

    expect(screen.getByRole('link', { name: 'Use' })).toHaveAttribute(
      'href',
      'https://admin.staging.test/?useTemplate=template-1'
    )
  })

  it('falls back to https://admin.nextstep.is for the Use button when NEXT_PUBLIC_JOURNEYS_ADMIN_URL is unset', () => {
    // beforeEach already deletes the env var; assert the documented
    // production fallback so future env wiring changes don't silently
    // alter where the deep link points.
    render(<GalleryTemplateCard template={mockTemplate} />)

    expect(screen.getByRole('link', { name: 'Use' })).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
  })

  it('URL-encodes special characters in template.id when building the deep link', () => {
    render(
      <GalleryTemplateCard
        template={{ ...mockTemplate, id: 'tmpl/with spaces&chars' }}
      />
    )

    expect(screen.getByRole('link', { name: 'Use' })).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=tmpl%2Fwith%20spaces%26chars'
    )
  })
})
