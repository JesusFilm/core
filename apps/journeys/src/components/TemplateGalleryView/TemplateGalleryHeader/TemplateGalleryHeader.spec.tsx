import { render, screen } from '@testing-library/react'

import { makeGallery } from '../galleryFixture'

import { TemplateGalleryHeader } from './TemplateGalleryHeader'

describe('TemplateGalleryHeader', () => {
  it('renders title, description, creator name, and avatar', () => {
    render(<TemplateGalleryHeader gallery={makeGallery()} />)
    expect(screen.getByText('Easter Gallery 2026')).toBeInTheDocument()
    expect(
      screen.getByText('A curated set of Easter outreach templates.')
    ).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByAltText('Jane Doe avatar')).toBeInTheDocument()
  })

  it('still renders the creator name when image is null', () => {
    render(
      <TemplateGalleryHeader
        gallery={makeGallery({
          creatorImageSrc: null,
          creatorImageAlt: null
        })}
      />
    )
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.queryByAltText('Jane Doe avatar')).not.toBeInTheDocument()
  })

  it('omits the description block when description is empty', () => {
    render(<TemplateGalleryHeader gallery={makeGallery({ description: '' })} />)
    expect(
      screen.queryByText('A curated set of Easter outreach templates.')
    ).not.toBeInTheDocument()
  })

  it('preserves user-entered newlines in the description (NES-1671)', () => {
    // The admin description TextField is `multiline` and the modal preview
    // (CollectionPreviewPane) already renders with `pre-wrap`. The public
    // page used to collapse newlines into a single paragraph — this asserts
    // both the inline DOM newlines and the `pre-wrap` style so future
    // refactors don't silently regress the preserved formatting.
    const description = '* Item 1\n* Item 2\n* Item 3'
    render(<TemplateGalleryHeader gallery={makeGallery({ description })} />)
    // `getByText` collapses whitespace by default; pass a custom matcher
    // that compares the raw textContent so the assertion proves the
    // `\n` characters survived rendering.
    const paragraph = screen.getByText(
      (_, element) => element?.textContent === description
    )
    expect(paragraph).toHaveStyle({ whiteSpace: 'pre-wrap' })
  })

  it('renders the avatar without a name when only the image is set', () => {
    render(<TemplateGalleryHeader gallery={makeGallery({ creatorName: '' })} />)
    expect(screen.getByAltText('Jane Doe avatar')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })

  it('omits the entire creator block when name and image are both empty', () => {
    render(
      <TemplateGalleryHeader
        gallery={makeGallery({
          creatorName: '',
          creatorImageSrc: null,
          creatorImageAlt: null
        })}
      />
    )
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Jane Doe avatar')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
