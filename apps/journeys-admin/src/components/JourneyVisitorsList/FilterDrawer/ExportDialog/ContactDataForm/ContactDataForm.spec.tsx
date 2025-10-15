import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'

import { ContactDataForm } from './ContactDataForm'

describe('ContactDataForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const ContactDataFormWithState = () => {
    const [selectedFields, setSelectedFields] = useState(() => [])
    return (
      <>
        <div data-testid="selected-fields">{selectedFields.join(', ')}</div>
        <ContactDataForm
          setSelectedFields={setSelectedFields}
          selectedFields={selectedFields}
        />
      </>
    )
  }

  it('renders all checkboxes with correct initial state', () => {
    render(<ContactDataFormWithState />)

    // Check if all contact data fields are rendered
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('Poll Selection')).toBeInTheDocument()
    expect(screen.getByLabelText('Subscription')).toBeInTheDocument()
    expect(screen.getByLabelText('Text Submission')).toBeInTheDocument()

    // Check initial state - all checkboxes should be checked
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByLabelText('Name')).toBeChecked()
    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('Phone')).toBeChecked()
    expect(screen.getByLabelText('Poll Selection')).toBeChecked()
    expect(screen.getByLabelText('Subscription')).toBeChecked()
    expect(screen.getByLabelText('Text Submission')).toBeChecked()
  })

  it('handles "Select All" checkbox correctly', () => {
    render(<ContactDataFormWithState />)
    const selectAllCheckbox = screen.getByLabelText('All')

    // Uncheck all
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).not.toBeChecked()
    expect(screen.getByLabelText('Name')).not.toBeChecked()
    expect(screen.getByLabelText('Email')).not.toBeChecked()
    expect(screen.getByLabelText('Phone')).not.toBeChecked()
    expect(screen.getByLabelText('Poll Selection')).not.toBeChecked()
    expect(screen.getByLabelText('Subscription')).not.toBeChecked()
    expect(screen.getByLabelText('Text Submission')).not.toBeChecked()

    // Check all again
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expect(screen.getByLabelText('Name')).toBeChecked()
    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('Phone')).toBeChecked()
    expect(screen.getByLabelText('Poll Selection')).toBeChecked()
    expect(screen.getByLabelText('Subscription')).toBeChecked()
    expect(screen.getByLabelText('Text Submission')).toBeChecked()
  })

  it('handles individual checkbox selection correctly', () => {
    render(<ContactDataFormWithState />)

    // Uncheck All
    fireEvent.click(screen.getByLabelText('Name'))
    fireEvent.click(screen.getByLabelText('Email'))
    fireEvent.click(screen.getByLabelText('Phone'))
    fireEvent.click(screen.getByLabelText('Poll Selection'))
    fireEvent.click(screen.getByLabelText('Subscription'))
    fireEvent.click(screen.getByLabelText('Text Submission'))
    expect(screen.getByTestId('selected-fields')).toHaveTextContent('')

    // Check Name
    fireEvent.click(screen.getByLabelText('Name'))
    expect(screen.getByLabelText('Name')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent('name')

    // Check Email
    fireEvent.click(screen.getByLabelText('Email'))
    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'name, email'
    )

    // Check Phone
    fireEvent.click(screen.getByLabelText('Phone'))
    expect(screen.getByLabelText('Phone')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'name, email, phone'
    )

    // Check Poll Selection
    fireEvent.click(screen.getByLabelText('Poll Selection'))
    expect(screen.getByLabelText('Poll Selection')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'name, email, phone, RadioQuestionSubmissionEvent'
    )

    // Check Subscription
    fireEvent.click(screen.getByLabelText('Subscription'))
    expect(screen.getByLabelText('Subscription')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'name, email, phone, RadioQuestionSubmissionEvent, SignUpSubmissionEvent'
    )

    // Check Text Submission
    fireEvent.click(screen.getByLabelText('Text Submission'))
    expect(screen.getByLabelText('Text Submission')).toBeChecked()
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'name, email, phone, RadioQuestionSubmissionEvent, SignUpSubmissionEvent, TextResponseSubmissionEvent'
    )
  })
})
