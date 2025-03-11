import { fireEvent, render, screen } from '@testing-library/react'

import { HeaderLinkAccordion } from './HeaderLinkAccordion'

describe('HeaderLinkAccordion', () => {
  const mockOnClose = jest.fn()
  const mockOnAccordionChange = jest.fn()
  const defaultSubLinks = [
    { url: '/about/mission', label: 'Our Mission' },
    { url: '/about/team', label: 'Our Team' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Simple Link Mode', () => {
    it('should render and handle a simple link when no subLinks are provided', () => {
      render(
        <HeaderLinkAccordion
          label="About Us"
          url="/about"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute(
        'href',
        '/about'
      )
    })
  })

  describe('Accordion Mode', () => {
    it('should render a collapsed accordion with hidden sublinks', () => {
      render(
        <HeaderLinkAccordion
          label="About"
          subLinks={defaultSubLinks}
          expanded={false}
          onAccordionChange={mockOnAccordionChange}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'About' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )

      defaultSubLinks.forEach(({ label }) => {
        expect(
          screen.queryByRole('link', { name: label })
        ).not.toBeInTheDocument()
      })
    })

    it('should show and handle sublinks when accordion is expanded', () => {
      render(
        <HeaderLinkAccordion
          label="About"
          subLinks={defaultSubLinks}
          expanded
          onAccordionChange={mockOnAccordionChange}
          onClose={mockOnClose}
        />
      )

      const accordionButton = screen.getByRole('button', { name: 'About' })
      expect(accordionButton).toHaveAttribute('aria-expanded', 'true')

      defaultSubLinks.forEach(({ url, label }) => {
        const link = screen.getByRole('link', { name: label })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', url)
      })
    })

    it('should call onClose when clicking a sublink', () => {
      render(
        <HeaderLinkAccordion
          label="About"
          subLinks={[defaultSubLinks[0]]}
          expanded
          onAccordionChange={mockOnAccordionChange}
          onClose={mockOnClose}
        />
      )

      fireEvent.click(
        screen.getByRole('link', {
          name: defaultSubLinks[0].label
        })
      )
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should handle accordion state changes', () => {
      render(
        <HeaderLinkAccordion
          label="About"
          subLinks={[defaultSubLinks[0]]}
          expanded={false}
          onAccordionChange={mockOnAccordionChange}
          onClose={mockOnClose}
        />
      )

      const accordionButton = screen.getByRole('button', { name: 'About' })
      fireEvent.click(accordionButton)
      expect(mockOnAccordionChange).toHaveBeenCalled()
    })
  })
})
