import { fireEvent, render, screen } from '@testing-library/react'

import { TemplateInfoPanel } from './TemplateInfoPanel'

describe('TemplateInfoPanel', () => {
  it('renders the always-visible header copy verbatim', () => {
    render(<TemplateInfoPanel />)

    expect(
      screen.getByText('What team templates are about:')
    ).toBeInTheDocument()
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

  describe('outer chrome', () => {
    it('renders a chrome-less wrapper by default (templates-tab behaviour)', () => {
      render(<TemplateInfoPanel />)

      const panel = screen.getByTestId('TemplateInfoPanel')
      expect(panel).not.toHaveClass('MuiPaper-root')
    })

    it('renders a Paper wrapper with rounded chrome when `contained` is true', () => {
      render(<TemplateInfoPanel contained />)

      const panel = screen.getByTestId('TemplateInfoPanel')
      expect(panel).toHaveClass('MuiPaper-root')
      expect(panel).toHaveClass('MuiPaper-rounded')
    })

    it('forwards `className` through both chrome modes', () => {
      const { rerender } = render(
        <TemplateInfoPanel className="my-custom-chrome" />
      )
      expect(screen.getByTestId('TemplateInfoPanel')).toHaveClass(
        'my-custom-chrome'
      )

      rerender(<TemplateInfoPanel contained className="my-custom-chrome" />)
      expect(screen.getByTestId('TemplateInfoPanel')).toHaveClass(
        'my-custom-chrome'
      )
    })

    it('preserves single-expand accordion behaviour under contained chrome', () => {
      render(<TemplateInfoPanel contained />)

      const templateTypes = screen.getByRole('button', {
        name: 'Template Types'
      })
      const tracking = screen.getByRole('button', {
        name: 'Tracking and Analytics'
      })

      fireEvent.click(templateTypes)
      expect(templateTypes).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(tracking)
      expect(templateTypes).toHaveAttribute('aria-expanded', 'false')
      expect(tracking).toHaveAttribute('aria-expanded', 'true')
    })

    it('honours `defaultExpanded` under contained chrome', () => {
      render(
        <TemplateInfoPanel contained defaultExpanded="sharingAndPublishing" />
      )

      expect(
        screen.getByRole('button', { name: 'Sharing and Publishing' })
      ).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps every accordion summary inside the panel chrome (no outer scroll wrapper)', () => {
      // Regression guard: an earlier shape wrapped the accordion list in a
      // dedicated scroll area, which hid summary headers when the expanded
      // body was long. The new structure keeps summaries inside the panel
      // directly so they remain reachable.
      render(<TemplateInfoPanel contained />)

      expect(
        screen.queryByTestId('TemplateInfoPanelScrollArea')
      ).not.toBeInTheDocument()

      const panel = screen.getByTestId('TemplateInfoPanel')
      for (const name of [
        'Template Types',
        'How to create',
        'Tracking and Analytics',
        'Sharing and Publishing'
      ]) {
        expect(panel).toContainElement(screen.getByRole('button', { name }))
      }
    })
  })

  describe('onClose close affordance', () => {
    it('does not render a close button when onClose is omitted', () => {
      render(<TemplateInfoPanel contained />)

      expect(
        screen.queryByTestId('TemplateInfoPanelClose')
      ).not.toBeInTheDocument()
    })

    it('renders a close button when onClose is provided under contained chrome', () => {
      render(<TemplateInfoPanel contained onClose={() => undefined} />)

      const closeButton = screen.getByTestId('TemplateInfoPanelClose')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Close template info')
    })

    it('invokes onClose when the close button is clicked', () => {
      const handleClose = jest.fn()
      render(<TemplateInfoPanel contained onClose={handleClose} />)

      fireEvent.click(screen.getByTestId('TemplateInfoPanelClose'))

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('ignores onClose when contained is false', () => {
      render(<TemplateInfoPanel onClose={() => undefined} />)

      expect(
        screen.queryByTestId('TemplateInfoPanelClose')
      ).not.toBeInTheDocument()
    })
  })
})
