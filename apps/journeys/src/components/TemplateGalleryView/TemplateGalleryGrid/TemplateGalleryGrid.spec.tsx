import { render, screen } from '@testing-library/react'

import { mockTemplate } from '../galleryFixture'

import { TemplateGalleryGrid } from './TemplateGalleryGrid'

vi.mock('./GalleryTemplateCard', () => ({
  GalleryTemplateCard: ({
    template,
    priority
  }: {
    template: { id: string; title: string }
    priority?: boolean
  }) => (
    <div
      data-testid="GalleryTemplateCardMock"
      data-template-id={template.id}
      data-priority={priority === true ? 'true' : 'false'}
    >
      {template.title}
    </div>
  )
}))

function makeTemplate(
  id: string,
  title: string
): typeof mockTemplate {
  return { ...mockTemplate, id, title }
}

describe('TemplateGalleryGrid', () => {
  it('renders one card per template in order', () => {
    render(
      <TemplateGalleryGrid
        templates={[
          makeTemplate('a', 'Alpha'),
          makeTemplate('b', 'Beta'),
          makeTemplate('c', 'Gamma'),
          makeTemplate('d', 'Delta')
        ]}
      />
    )
    const cards = screen.getAllByTestId('GalleryTemplateCardMock')
    expect(cards).toHaveLength(4)
    expect(cards.map((c) => c.getAttribute('data-template-id'))).toEqual([
      'a',
      'b',
      'c',
      'd'
    ])
  })

  it('forwards priority=true to the first three cards only', () => {
    render(
      <TemplateGalleryGrid
        templates={[
          makeTemplate('a', 'Alpha'),
          makeTemplate('b', 'Beta'),
          makeTemplate('c', 'Gamma'),
          makeTemplate('d', 'Delta'),
          makeTemplate('e', 'Epsilon')
        ]}
      />
    )
    const cards = screen.getAllByTestId('GalleryTemplateCardMock')
    expect(cards.map((c) => c.getAttribute('data-priority'))).toEqual([
      'true',
      'true',
      'true',
      'false',
      'false'
    ])
  })

  it('renders the scroller wrapper with its testid even with no templates', () => {
    render(<TemplateGalleryGrid templates={[]} />)
    expect(screen.getByTestId('TemplateGalleryGrid')).toBeInTheDocument()
    expect(
      screen.queryByTestId('GalleryTemplateCardMock')
    ).not.toBeInTheDocument()
  })
})
