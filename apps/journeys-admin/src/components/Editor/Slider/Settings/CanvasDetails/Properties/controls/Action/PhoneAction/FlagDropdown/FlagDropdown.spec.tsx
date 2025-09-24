import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { Country } from './countriesList'
import { FlagDropdown } from './FlagDropdown'

describe('FlagDropdown', () => {
  const mockCountries: Country[] = [
    {
      countryCode: 'US',
      label: 'United States',
      callingCode: '+1'
    },
    {
      countryCode: 'CA',
      label: 'Canada',
      callingCode: '+1'
    },
    {
      countryCode: 'GB',
      label: 'United Kingdom',
      callingCode: '+44'
    },
    {
      countryCode: 'FR',
      label: 'France',
      callingCode: '+33'
    },
    {
      countryCode: 'DE',
      label: 'Germany',
      callingCode: '+49'
    }
  ]

  const mockHandleChange = jest.fn()
  const defaultSelectedCountry = mockCountries[0] // United States

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with selected country flag and dropdown button', () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    expect(screen.getByRole('button', { name: 'Select country' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'United States flag' })).toBeInTheDocument()
  })

  it('displays all country options when opened', async () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select country' }))

    await waitFor(() => {
      expect(screen.getByText('United States (US) +1')).toBeInTheDocument()
      expect(screen.getByText('Canada (CA) +1')).toBeInTheDocument()
      expect(screen.getByText('United Kingdom (GB) +44')).toBeInTheDocument()
      expect(screen.getByText('France (FR) +33')).toBeInTheDocument()
      expect(screen.getByText('Germany (DE) +49')).toBeInTheDocument()
    })
  })

  it('displays selected country with flag in button', () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    expect(
      screen.getByRole('img', { name: 'United States flag' })
    ).toHaveAttribute('alt', 'United States flag')
    expect(
      screen.getByRole('img', { name: 'United States flag' })
    ).toHaveAttribute('src', 'https://flagcdn.com/w20/us.png')
  })

  it('calls onChange when a country is selected', async () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select country' }))

    await waitFor(() => {
      expect(screen.getByText('Canada (CA) +1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Canada (CA) +1'))

    expect(mockHandleChange).toHaveBeenCalledWith(mockCountries[1])
  })

  it('filters countries based on search input', async () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select country' }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Search countries...'), {
      target: { value: 'uni' }
    })

    await waitFor(() => {
      expect(screen.getByText('United States (US) +1')).toBeInTheDocument()
      expect(screen.getByText('United Kingdom (GB) +44')).toBeInTheDocument()
      expect(screen.queryByText('Canada (CA) +1')).not.toBeInTheDocument()
      expect(screen.queryByText('France (FR) +33')).not.toBeInTheDocument()
    })
  })

  it('renders country flags in menu options', async () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select country' }))

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
    })
  })

  it('shows no options when search text does not match any country', async () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Select country' }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Search countries...'), {
      target: { value: 'xyz' }
    })

    await waitFor(() => {
      expect(screen.queryByText('United States (US) +1')).not.toBeInTheDocument()
      expect(screen.queryByText('Canada (CA) +1')).not.toBeInTheDocument()
    })
  })

  it('supports keyboard navigation to open menu', () => {
    render(
      <FlagDropdown
        countries={mockCountries}
        selectedCountry={defaultSelectedCountry}
        onChange={mockHandleChange}
      />
    )

    const button = screen.getByRole('button', { name: 'Select country' })
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument()
  })
})