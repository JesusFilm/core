import { fireEvent, render, screen } from '@testing-library/react'

import { TemplateInfoAccordion } from './TemplateInfoAccordion'

describe('TemplateInfoAccordion', () => {
  it('renders the title and children when expanded', () => {
    render(
      <TemplateInfoAccordion
        id="example"
        title="Example title"
        expanded
        onChange={jest.fn()}
      >
        <p>Example body</p>
      </TemplateInfoAccordion>
    )

    expect(screen.getByText('Example title')).toBeInTheDocument()
    expect(screen.getByText('Example body')).toBeInTheDocument()
  })

  it('fires onChange with the next expanded state when the summary is clicked', () => {
    const handleChange = jest.fn()
    render(
      <TemplateInfoAccordion
        id="example"
        title="Example title"
        expanded={false}
        onChange={handleChange}
      >
        <p>Example body</p>
      </TemplateInfoAccordion>
    )

    fireEvent.click(screen.getByText('Example title'))

    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('fires onChange(false) when an already-expanded summary is clicked', () => {
    const handleChange = jest.fn()
    render(
      <TemplateInfoAccordion
        id="example"
        title="Example title"
        expanded
        onChange={handleChange}
      >
        <p>Example body</p>
      </TemplateInfoAccordion>
    )

    fireEvent.click(screen.getByText('Example title'))

    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('wires aria-controls between the summary and the body for keyboard users', () => {
    render(
      <TemplateInfoAccordion
        id="example"
        title="Example title"
        expanded
        onChange={jest.fn()}
      >
        <p>Example body</p>
      </TemplateInfoAccordion>
    )

    const summary = screen.getByRole('button', { name: 'Example title' })
    expect(summary).toHaveAttribute(
      'id',
      'template-info-accordion-summary-example'
    )
    expect(summary).toHaveAttribute(
      'aria-controls',
      'template-info-accordion-content-example'
    )
  })
})
