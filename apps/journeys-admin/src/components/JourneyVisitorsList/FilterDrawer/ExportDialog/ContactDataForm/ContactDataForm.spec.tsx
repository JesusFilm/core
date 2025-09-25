import { fireEvent, render, screen } from '@testing-library/react'

import { ContactDataForm } from './ContactDataForm'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

describe('ContactDataForm', () => {
  const mockSetContactData = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all checkboxes with correct initial state', () => {
    render(<ContactDataForm setContactData={mockSetContactData} />)

    // Check if all contact data fields are rendered
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()

    // Check initial state - all checkboxes should be checked
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByLabelText('Name')).toBeChecked()
    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('Phone')).toBeChecked()
  })

  it('handles "Select All" checkbox correctly', () => {
    render(<ContactDataForm setContactData={mockSetContactData} />)
    const selectAllCheckbox = screen.getByLabelText('All')

    // Uncheck all
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).not.toBeChecked()
    expect(screen.getByLabelText('Name')).not.toBeChecked()
    expect(screen.getByLabelText('Email')).not.toBeChecked()
    expect(screen.getByLabelText('Phone')).not.toBeChecked()

    // Check all again
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expect(screen.getByLabelText('Name')).toBeChecked()
    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('Phone')).toBeChecked()
  })

  it('handles individual checkbox selection correctly', () => {
    render(<ContactDataForm setContactData={mockSetContactData} />)

    // Uncheck Name
    fireEvent.click(screen.getByLabelText('Name'))
    expect(screen.getByLabelText('Name')).not.toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()

    // Uncheck Email
    fireEvent.click(screen.getByLabelText('Email'))
    expect(screen.getByLabelText('Email')).not.toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()

    // Check Name again
    fireEvent.click(screen.getByLabelText('Name'))
    expect(screen.getByLabelText('Name')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked() // Still not all selected

    // Check Email again
    fireEvent.click(screen.getByLabelText('Email'))
    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('All')).toBeChecked() // Now all selected
  })

  it('calls setContactData with correct contact data fields', () => {
    render(<ContactDataForm setContactData={mockSetContactData} />)

    // Initially all fields should be selected
    expect(mockSetContactData).toHaveBeenCalledWith(['name', 'email', 'phone'])

    // Uncheck Name
    fireEvent.click(screen.getByLabelText('Name'))

    // Verify the callback excludes the unchecked field
    const lastCall =
      mockSetContactData.mock.calls[mockSetContactData.mock.calls.length - 1][0]
    expect(lastCall).toEqual(['email', 'phone'])

    // Uncheck Email
    fireEvent.click(screen.getByLabelText('Email'))
    const secondLastCall =
      mockSetContactData.mock.calls[mockSetContactData.mock.calls.length - 1][0]
    expect(secondLastCall).toEqual(['phone'])

    // Uncheck Phone
    fireEvent.click(screen.getByLabelText('Phone'))
    const thirdLastCall =
      mockSetContactData.mock.calls[mockSetContactData.mock.calls.length - 1][0]
    expect(thirdLastCall).toEqual([])
  })
})
