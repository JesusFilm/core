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
    expect(screen.getByLabelText('Poll Selection')).toBeInTheDocument()
    expect(screen.getByLabelText('Subscription')).toBeInTheDocument()
    expect(screen.getByLabelText('Text Submission')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Multiselect Selection(s)')
    ).toBeInTheDocument()

    // Check initial state - all checkboxes should be checked
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByLabelText('Poll Selection')).toBeChecked()
    expect(screen.getByLabelText('Subscription')).toBeChecked()
    expect(screen.getByLabelText('Text Submission')).toBeChecked()
    expect(screen.getByLabelText('Multiselect Selection(s)')).toBeChecked()
  })

  it('handles "Select All" checkbox correctly', () => {
    render(<ContactDataFormWithState />)
    const selectAllCheckbox = screen.getByLabelText('All')

    // Uncheck all
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).not.toBeChecked()
    expect(screen.getByLabelText('Poll Selection')).not.toBeChecked()
    expect(screen.getByLabelText('Subscription')).not.toBeChecked()
    expect(screen.getByLabelText('Text Submission')).not.toBeChecked()
    expect(screen.getByLabelText('Multiselect Selection(s)')).not.toBeChecked()

    // Check all again
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expect(screen.getByLabelText('Poll Selection')).toBeChecked()
    expect(screen.getByLabelText('Subscription')).toBeChecked()
    expect(screen.getByLabelText('Text Submission')).toBeChecked()
    expect(screen.getByLabelText('Multiselect Selection(s)')).toBeChecked()
  })

  it('handles individual checkbox selection correctly', () => {
    render(<ContactDataFormWithState />)

    // Uncheck All
    fireEvent.click(screen.getByLabelText('Poll Selection'))
    fireEvent.click(screen.getByLabelText('Subscription'))
    fireEvent.click(screen.getByLabelText('Text Submission'))
    fireEvent.click(screen.getByLabelText('Multiselect Selection(s)'))
    expect(screen.getByTestId('selected-fields')).toHaveTextContent('')

    // Check Poll Selection
    fireEvent.click(screen.getByLabelText('Poll Selection'))
    expect(screen.getByLabelText('Poll Selection')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'RadioQuestionSubmissionEvent'
    )

    // Check Subscription
    fireEvent.click(screen.getByLabelText('Subscription'))
    expect(screen.getByLabelText('Subscription')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'RadioQuestionSubmissionEvent, SignUpSubmissionEvent'
    )

    // Check Text Submission
    fireEvent.click(screen.getByLabelText('Text Submission'))
    expect(screen.getByLabelText('Text Submission')).toBeChecked()
    expect(screen.getByLabelText('All')).not.toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'RadioQuestionSubmissionEvent, SignUpSubmissionEvent, TextResponseSubmissionEvent'
    )

    // Check Multiselect Selection(s)
    fireEvent.click(screen.getByLabelText('Multiselect Selection(s)'))
    expect(screen.getByLabelText('Multiselect Selection(s)')).toBeChecked()
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByTestId('selected-fields')).toHaveTextContent(
      'RadioQuestionSubmissionEvent, SignUpSubmissionEvent, TextResponseSubmissionEvent, MultiselectSubmissionEvent'
    )
  })
})
