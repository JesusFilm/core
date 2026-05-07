import { render, screen } from '@testing-library/react'

import { TemplateGalleryMedia } from './TemplateGalleryMedia'

describe('TemplateGalleryMedia', () => {
  it('renders the strategy section when mediaUrl is set', () => {
    render(
      <TemplateGalleryMedia mediaUrl="https://www.canva.com/design/abc/view" />
    )
    expect(screen.getByTestId('TemplateGalleryMedia')).toBeInTheDocument()
  })

  it('renders nothing when mediaUrl is null', () => {
    const { container } = render(<TemplateGalleryMedia mediaUrl={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when mediaUrl is empty', () => {
    const { container } = render(<TemplateGalleryMedia mediaUrl="" />)
    expect(container).toBeEmptyDOMElement()
  })
})
