import { render, screen } from '@testing-library/react'

import { TemplateGalleryMedia } from './TemplateGalleryMedia'

vi.mock('@core/journeys/ui/StrategySection', () => ({
  StrategySection: ({
    strategySlug,
    variant
  }: {
    strategySlug?: string
    variant?: string
  }) => (
    <div
      data-testid="StrategySectionMock"
      data-strategy-slug={strategySlug}
      data-variant={variant}
    />
  )
}))

describe('TemplateGalleryMedia', () => {
  it('renders the Strategy heading and forwards mediaUrl to StrategySection', () => {
    render(
      <TemplateGalleryMedia mediaUrl="https://www.canva.com/design/abc/view" />
    )
    expect(screen.getByTestId('TemplateGalleryMedia')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 5, name: 'Strategy' })
    ).toBeInTheDocument()
    const stub = screen.getByTestId('StrategySectionMock')
    expect(stub).toHaveAttribute(
      'data-strategy-slug',
      'https://www.canva.com/design/abc/view'
    )
    expect(stub).toHaveAttribute('data-variant', 'placeholder')
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
