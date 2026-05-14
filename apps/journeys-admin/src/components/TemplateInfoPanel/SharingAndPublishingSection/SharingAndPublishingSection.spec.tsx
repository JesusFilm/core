import { render, screen } from '@testing-library/react'

import { SharingAndPublishingSection } from './SharingAndPublishingSection'

describe('SharingAndPublishingSection', () => {
  it('renders all four paragraphs of body copy', () => {
    render(<SharingAndPublishingSection />)

    expect(
      screen.getByText(
        'When your template is ready (you set trackable and customizable items) you can publish it.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('You can add as many templates as you want!')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Anyone with the link can use your project as template/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /You also can use your template with any team you have access to/
      )
    ).toBeInTheDocument()
  })

  it('renders "Publish" and "Use in a team" as bold inline emphasis', () => {
    render(<SharingAndPublishingSection />)

    expect(screen.getByText('Publish').tagName).toBe('STRONG')
    expect(screen.getByText('Use in a team').tagName).toBe('STRONG')
  })

  it('uses "three dots menu" everywhere (not Figma\'s typo "there dots menu")', () => {
    render(<SharingAndPublishingSection />)

    const section = screen.getByTestId('SharingAndPublishingSection')
    const text = section.textContent ?? ''
    expect(text).toContain('three dots menu')
    expect(text).not.toContain('there dots menu')
  })

  it('renders the publish flow GIF', () => {
    render(<SharingAndPublishingSection />)

    expect(
      screen.getByAltText(
        'Publish flow via three dots menu and/or Use in a team flow'
      )
    ).toHaveAttribute('src', '/assets/template-info/publish-and-share-flow.gif')
  })
})
