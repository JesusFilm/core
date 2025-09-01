import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CountryCodeAutoComplete } from './CountryCodeAutoComplete'
import { Country } from './countriesList'

describe('CountryCodeAutoComplete', () => {
  const mockCountries: Country[] = [
    {
      countryCode: 'US',
      label: 'United States',
      callingCode: '+1',
      placeholder: '(201) 555-0123'
    },
    {
      countryCode: 'CA',
      label: 'Canada',
      callingCode: '+1',
      placeholder: '(506) 234-5678'
    },
    {
      countryCode: 'GB',
      label: 'United Kingdom',
      callingCode: '+44',
      placeholder: '07400 123456'
    },
    {
      countryCode: 'FR',
      label: 'France',
      callingCode: '+33',
      placeholder: '06 12 34 56 78'
    },
    {
      countryCode: 'DE',
      label: 'Germany',
      callingCode: '+49',
      placeholder: '0151 23456789'
    }
  ]

  const mockHandleChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct label and placeholder', () => {
    render(
      <CountryCodeAutoComplete
        countries={mockCountries}
        handleChange={mockHandleChange}
      />
    )

    expect(screen.getByLabelText('Country')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Select country')).toBeInTheDocument()
  })

  it('displays all country options when opened', async () => {
    render(
      <CountryCodeAutoComplete
        countries={mockCountries}
        handleChange={mockHandleChange}
      />
    )

    fireEvent.focus(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Country' }), {
      key: 'ArrowDown'
    })

    await waitFor(() => {
      expect(screen.getAllByRole('option')[0]).toHaveTextContent(
        'United States (US) +1'
      )
      expect(screen.getAllByRole('option')[1]).toHaveTextContent(
        'Canada (CA) +1'
      )
      expect(screen.getAllByRole('option')[2]).toHaveTextContent(
        'United Kingdom (GB) +44'
      )
      expect(screen.getAllByRole('option')[3]).toHaveTextContent(
        'France (FR) +33'
      )
      expect(screen.getAllByRole('option')[4]).toHaveTextContent(
        'Germany (DE) +49'
      )
    })
  })

  it('displays selected country with flag in input adornment', () => {
    const selectedCountry = mockCountries[0] // United States
    render(
      <CountryCodeAutoComplete
        countries={mockCountries}
        selectedCountry={selectedCountry}
        handleChange={mockHandleChange}
      />
    )

    expect(
      screen.getByRole('img', { name: 'United States flag' })
    ).toHaveAttribute('alt', 'United States flag')
    expect(
      screen.getByRole('img', { name: 'United States flag' })
    ).toHaveAttribute('src', 'https://flagcdn.com/w20/us.png')
  })

  it('calls handleChange when a country is selected', async () => {
    render(
      <CountryCodeAutoComplete
        countries={mockCountries}
        handleChange={mockHandleChange}
      />
    )

    fireEvent.focus(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Country' }), {
      key: 'ArrowDown'
    })

    fireEvent.click(
      screen.getByRole('option', {
        name: 'Canada flag Canada (CA) +1'
      })
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue(
        'Canada'
      )
    )

    expect(mockHandleChange).toHaveBeenCalledWith(mockCountries[1])
  })

  it('filters countries based on input text', async () => {
    render(
      <CountryCodeAutoComplete
        countries={mockCountries}
        handleChange={mockHandleChange}
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Country' }), {
      target: { value: 'uni' }
    })

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /United States/ })
      ).toHaveTextContent('United States (US) +1')
      expect(
        screen.getByRole('option', { name: /United Kingdom/ })
      ).toHaveTextContent('United Kingdom (GB) +44')
      expect(
        screen.queryByRole('option', { name: /Canada/ })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('option', { name: /France/ })
      ).not.toBeInTheDocument()
    })
  })

  it('renders country flags in options', async () => {
    render(
      <CountryCodeAutoComplete
        countries={mockCountries}
        handleChange={mockHandleChange}
      />
    )

    fireEvent.focus(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Country' }), {
      key: 'ArrowDown'
    })

    await waitFor(() => {
      expect(
        screen.getByRole('img', { name: 'United States flag' })
      ).toHaveAttribute('src', 'https://flagcdn.com/w20/us.png')
      expect(screen.getByRole('img', { name: 'Canada flag' })).toHaveAttribute(
        'src',
        'https://flagcdn.com/w20/ca.png'
      )
      expect(
        screen.getByRole('img', { name: 'United Kingdom flag' })
      ).toHaveAttribute('src', 'https://flagcdn.com/w20/gb.png')
      expect(screen.getByRole('img', { name: 'France flag' })).toHaveAttribute(
        'src',
        'https://flagcdn.com/w20/fr.png'
      )
      expect(screen.getByRole('img', { name: 'Germany flag' })).toHaveAttribute(
        'src',
        'https://flagcdn.com/w20/de.png'
      )
    })
  })

  it('shows no options when filter text does not match any country', async () => {
    render(
      <CountryCodeAutoComplete
        countries={mockCountries}
        handleChange={mockHandleChange}
      />
    )

    fireEvent.focus(screen.getByRole('combobox', { name: 'Country' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Country' }), {
      target: { value: 'xyz' }
    })

    await waitFor(() => {
      expect(screen.queryByRole('option')).not.toBeInTheDocument()
      expect(screen.getByText('No options')).toBeInTheDocument()
    })
  })
})
