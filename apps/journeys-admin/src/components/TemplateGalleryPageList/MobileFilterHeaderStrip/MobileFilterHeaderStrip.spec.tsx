import { render, screen } from '@testing-library/react'

import '../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'

import { MobileFilterHeaderStrip } from './MobileFilterHeaderStrip'

function makeCollection(
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'page-1',
    title: 'Easter Series',
    description: '',
    slug: 'easter-series',
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    mediaUrl: null,
    publishedAt: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    templates: [],
    ...overrides
  }
}

describe('MobileFilterHeaderStrip', () => {
  it('renders "All Templates" with count and hides the menu when no collection is selected', () => {
    render(<MobileFilterHeaderStrip selectedCollection={null} count={12} />)
    expect(screen.getByText('All Templates')).toBeInTheDocument()
    expect(screen.getByText(/12 templates/)).toBeInTheDocument()
    // The 3-dot menu must not render for the All Templates filter.
    expect(
      screen.queryByRole('button', { name: 'Collection actions' })
    ).not.toBeInTheDocument()
  })

  it('renders the collection name with count and shows the menu when a collection is selected', () => {
    render(
      <MobileFilterHeaderStrip
        selectedCollection={makeCollection()}
        count={4}
      />
    )
    expect(screen.getByText('Easter Series')).toBeInTheDocument()
    expect(screen.getByText(/4 templates/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Collection actions' })
    ).toBeInTheDocument()
  })
})
