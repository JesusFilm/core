import { render, screen } from '@testing-library/react'

import { HowToCreateSection } from './HowToCreateSection'

describe('HowToCreateSection', () => {
  it('renders the two top-level steps for making a template', () => {
    render(<HowToCreateSection />)

    expect(
      screen.getByText('Click on the three dots on your project card.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Select the Make Template option.')
    ).toBeInTheDocument()
  })

  it('uses the corrected callout copy ("you need", not Figma\'s "your need")', () => {
    render(<HowToCreateSection />)

    expect(
      screen.getByText(
        'If you want to have a Quick-Start template, you need to prepare it.'
      )
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'If you want to have Quick-Start template, your need to prepare it.'
      )
    ).not.toBeInTheDocument()
  })

  it('renders both How-to GIFs', () => {
    render(<HowToCreateSection />)

    expect(
      screen.getByAltText(
        'Making a template: click three dots → select Make Template'
      )
    ).toHaveAttribute('src', '/assets/template-info/make-template-flow.gif')

    expect(
      screen.getByAltText(
        'Text variable customization: highlight text → replace with {{var}} → open Template Settings → paste original after colon'
      )
    ).toHaveAttribute('src', '/assets/template-info/text-variable-flow.gif')
  })

  it('renders the Links/Images/Video sub-section with bolded "Make Customisable"', () => {
    render(<HowToCreateSection />)

    expect(screen.getByText('Links, Images, Video')).toBeInTheDocument()
    expect(screen.getByText('Make Customisable')).toBeInTheDocument()
    expect(screen.getByText('Make Customisable').tagName).toBe('STRONG')
  })

  it('renders the Text sub-section with verbatim {{date}} and {{date: May, 8}} code samples in <code>', () => {
    render(<HowToCreateSection />)

    expect(screen.getByText('Text')).toBeInTheDocument()
    const dateSample = screen.getByText('{{date}}')
    expect(dateSample.tagName).toBe('CODE')
    const dateValueSample = screen.getByText('{{date: May, 8}}')
    expect(dateValueSample.tagName).toBe('CODE')
  })
})
