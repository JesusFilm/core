import { render, screen, within } from '@testing-library/react'

import { TemplateTypesSection } from './TemplateTypesSection'

describe('TemplateTypesSection', () => {
  it('renders Quick-Start before Regular (Figma order, not ticket order)', () => {
    render(<TemplateTypesSection />)

    const section = screen.getByTestId('TemplateTypesSection')
    const text = section.textContent ?? ''
    const quickStartIndex = text.indexOf('Quick-Start')
    const regularIndex = text.indexOf('Regular')

    expect(quickStartIndex).toBeGreaterThan(-1)
    expect(regularIndex).toBeGreaterThan(-1)
    expect(quickStartIndex).toBeLessThan(regularIndex)
  })

  it('shows the RECOMMENDED chip next to Quick-Start, not Regular', () => {
    render(<TemplateTypesSection />)

    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument()
  })

  it('uses the corrected spelling RECOMMENDED (Figma typo was "RECOMENDED")', () => {
    render(<TemplateTypesSection />)

    expect(screen.queryByText('RECOMENDED')).not.toBeInTheDocument()
    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument()
  })

  it('renders both screenshots with non-empty alt text', () => {
    render(<TemplateTypesSection />)

    const quickStartImage = screen.getByAltText(
      'Quick-Start template guided editing UI — mobile-friendly'
    )
    const regularImage = screen.getByAltText(
      'Regular template editor interface — desktop multi-screen view'
    )

    expect(quickStartImage).toHaveAttribute(
      'src',
      '/assets/template-info/template-types-quick-start.png'
    )
    expect(regularImage).toHaveAttribute(
      'src',
      '/assets/template-info/template-types-regular.png'
    )
    expect(quickStartImage).toHaveAttribute('loading', 'lazy')
  })

  it('renders three bullets under each variant', () => {
    render(<TemplateTypesSection />)

    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)
    expect(within(lists[0]).getAllByRole('listitem')).toHaveLength(3)
    expect(within(lists[1]).getAllByRole('listitem')).toHaveLength(3)
  })
})
