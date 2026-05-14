import { fireEvent, render, screen } from '@testing-library/react'

import { TemplateInfoPanel } from './TemplateInfoPanel'

describe('TemplateInfoPanel', () => {
  it('renders the always-visible header copy verbatim', () => {
    render(<TemplateInfoPanel />)

    expect(screen.getByText('What templates are about:')).toBeInTheDocument()
    expect(
      screen.getByText(
        'You can share projects created on our platform with others. This allows you to track the performance of every project generated from your template.'
      )
    ).toBeInTheDocument()
  })

  it('renders all five accordion section titles in the canonical order', () => {
    render(<TemplateInfoPanel />)

    const titles = screen.getAllByRole('button').map((b) => b.textContent)

    expect(titles).toEqual([
      'Template Types',
      'How to create',
      'Tracking and Analytics',
      'Sharing and Publishing',
      'Embedding Canva or Google Slides'
    ])
  })

  it('defaults to all sections collapsed', () => {
    render(<TemplateInfoPanel />)

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-expanded', 'false')
    }
  })

  it('expands a section when its summary is clicked and collapses it on a second click', () => {
    render(<TemplateInfoPanel />)

    const howToCreate = screen.getByRole('button', { name: 'How to create' })

    fireEvent.click(howToCreate)
    expect(howToCreate).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(howToCreate)
    expect(howToCreate).toHaveAttribute('aria-expanded', 'false')
  })

  it('enforces single-expand: opening a new section collapses the previously expanded one', () => {
    render(<TemplateInfoPanel />)

    const templateTypes = screen.getByRole('button', { name: 'Template Types' })
    const tracking = screen.getByRole('button', {
      name: 'Tracking and Analytics'
    })

    fireEvent.click(templateTypes)
    expect(templateTypes).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(tracking)
    expect(templateTypes).toHaveAttribute('aria-expanded', 'false')
    expect(tracking).toHaveAttribute('aria-expanded', 'true')
  })

  it('honours `defaultExpanded` on first render', () => {
    render(<TemplateInfoPanel defaultExpanded="sharingAndPublishing" />)

    expect(
      screen.getByRole('button', { name: 'Sharing and Publishing' })
    ).toHaveAttribute('aria-expanded', 'true')
  })
})
