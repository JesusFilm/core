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

  it('renders the canonical accordion section titles in order', () => {
    render(<TemplateInfoPanel />)

    const sectionNames = [
      'Template Types',
      'How to create',
      'Tracking and Analytics',
      'Sharing and Publishing'
    ]

    // Resolve each accordion summary by its accessible name (survives the
    // addition of unrelated buttons in the panel), then verify the document
    // order matches the canonical sequence by comparing positions.
    const positions = sectionNames.map((name) => {
      const button = screen.getByRole('button', { name })
      return Array.from(document.querySelectorAll('[role="button"]')).indexOf(
        button
      )
    })
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('defaults all section summaries to collapsed', () => {
    render(<TemplateInfoPanel />)

    for (const name of [
      'Template Types',
      'How to create',
      'Tracking and Analytics',
      'Sharing and Publishing'
    ]) {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
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
