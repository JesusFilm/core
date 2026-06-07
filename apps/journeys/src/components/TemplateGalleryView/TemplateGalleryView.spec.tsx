import { render, screen } from '@testing-library/react'

import { makeGallery, makeLinkMedia, mockTemplate } from './galleryFixture'
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

  it('forwards the template id into the Use Template link', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({ templates: [mockTemplate] })}
      />
    )
    expect(screen.getByTestId('GalleryTemplateCardUseButton')).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
  })

  it('maps link media into the media section', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({
          media: makeLinkMedia(
            'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
          ),
          templates: [mockTemplate]
        })}
      />
    )
    expect(screen.getByTestId('TemplateGalleryMediaIframe')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    )
  })

  it('omits the media section when media is null (legacy row)', () => {
    render(<TemplateGalleryView gallery={makeGallery({ media: null })} />)
    expect(
      screen.queryByTestId('TemplateGalleryMedia')
    ).not.toBeInTheDocument()
  })
})
