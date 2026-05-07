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
    render(
      <TemplateGalleryHeader gallery={makeGallery({ description: '' })} />
    )
    expect(
      screen.queryByText('A curated set of Easter outreach templates.')
    ).not.toBeInTheDocument()
  })

  it('renders the avatar without a name when only the image is set', () => {
    render(
      <TemplateGalleryHeader
        gallery={makeGallery({ creatorName: '' })}
      />
    )
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
