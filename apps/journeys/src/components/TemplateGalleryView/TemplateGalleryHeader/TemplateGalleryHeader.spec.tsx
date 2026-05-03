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
        gallery={makeGallery({ creatorImageBlock: null })}
      />
    )
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.queryByAltText('Jane Doe avatar')).not.toBeInTheDocument()
  })

  it('omits the description block when description is empty', () => {
    render(
      <TemplateGalleryHeader gallery={makeGallery({ description: '' })} />
    )
    expect(
      screen.queryByText('A curated set of Easter outreach templates.')
    ).not.toBeInTheDocument()
  })
})
