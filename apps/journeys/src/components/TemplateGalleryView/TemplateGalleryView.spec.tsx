import { render, screen } from '@testing-library/react'

import { makeGallery, mockTemplate } from './galleryFixture'
import { TemplateGalleryView } from './TemplateGalleryView'

describe('TemplateGalleryView', () => {
  it('maps the gallery and renders the journey view', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({ templates: [mockTemplate] })}
      />
    )
    expect(screen.getByTestId('TemplateGallerySections')).toBeInTheDocument()
    expect(screen.getByTestId('TemplateGalleryHeader')).toBeInTheDocument()
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
  })

  it('forwards the template id and slug into the card action links', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({ templates: [mockTemplate] })}
      />
    )
    expect(screen.getByTestId('GalleryTemplateCardUseButton')).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
    expect(
      screen.getByTestId('GalleryTemplateCardPreviewButton')
    ).toHaveAttribute('href', '/sample-template')
  })
})
