import { fireEvent, render, screen } from '@testing-library/react'

import { SectionNewsletterSignup } from './SectionNewsletterSignup'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string; email?: string }) => {
      const value = options?.defaultValue ?? key

      if (options?.email != null) {
        return value.replace('{{email}}', options.email)
      }

      return value
    }
  })
}))

describe('SectionNewsletterSignup', () => {
  it('renders newsletter content', () => {
    render(<SectionNewsletterSignup />)

    expect(
      screen.getByText('Every month we add new gospel videos to our library, new translations, releases, and tools. Subscribe to our email to be notified about new tools and new media available for you.')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByText('Missionary')).toBeInTheDocument()
  })

  it('shows typed email preview message', () => {
    render(<SectionNewsletterSignup />)

    const emailInput = screen.getByLabelText('Email address')
    fireEvent.change(emailInput, { target: { value: 'person@example.com' } })

    expect(screen.getByText('We will send updates to person@example.com.')).toBeInTheDocument()
  })

  it('displays confirmation after submitting the form', () => {
    render(<SectionNewsletterSignup />)

    const emailInput = screen.getByLabelText('Email address')
    fireEvent.change(emailInput, { target: { value: 'mission@example.com' } })

    const submitButton = screen.getByRole('button', { name: 'Subscribe' })
    fireEvent.click(submitButton)

    expect(
      screen.getByText('Thanks for subscribing! We will keep you updated.')
    ).toBeInTheDocument()
  })
})
