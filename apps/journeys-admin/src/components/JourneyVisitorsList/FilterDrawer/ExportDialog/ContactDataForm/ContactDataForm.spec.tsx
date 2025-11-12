import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
          availableBlockTypes={[
            'RadioQuestionBlock',
            'MultiselectBlock',
            'SignUpBlock',
            'TextResponseBlock'
          ]}
        />
      </>
    )
  }

  it('renders all checkboxes with correct initial state', () => {
    render(<ContactDataFormWithState />)

    // Check if all contact data fields are rendered
    expect(screen.getByLabelText('Poll Selection')).toBeInTheDocument()
    expect(screen.getByLabelText('Multiselect Responses')).toBeInTheDocument()
    expect(screen.getByLabelText('Subscription')).toBeInTheDocument()
    expect(screen.getByLabelText('Text Submission')).toBeInTheDocument()

    // Check initial state - all checkboxes should be checked
    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByLabelText('Poll Selection')).toBeChecked()
    expect(screen.getByLabelText('Subscription')).toBeChecked()
    expect(screen.getByLabelText('Text Submission')).toBeChecked()
    expect(screen.getByLabelText('Multiselect Responses')).toBeChecked()
  })

  it('handles "Select All" checkbox correctly', () => {
    render(<ContactDataFormWithState />)
    const selectAllCheckbox = screen.getByLabelText('All')

    // Uncheck all
    userEvent.click(selectAllCheckbox)
    waitFor(() => {
      expect(selectAllCheckbox).not.toBeChecked()
      expect(screen.getByLabelText('Poll Selection')).not.toBeChecked()
      expect(screen.getByLabelText('Subscription')).not.toBeChecked()
      expect(screen.getByLabelText('Text Submission')).not.toBeChecked()
      expect(screen.getByLabelText('Multiselect Responses')).not.toBeChecked()
    })

    // Check all again
    userEvent.click(selectAllCheckbox)
    waitFor(() => {
      expect(selectAllCheckbox).toBeChecked()
      expect(screen.getByLabelText('Poll Selection')).toBeChecked()
      expect(screen.getByLabelText('Subscription')).toBeChecked()
      expect(screen.getByLabelText('Text Submission')).toBeChecked()
      expect(screen.getByLabelText('Multiselect Responses')).toBeChecked()
    })
  })

  it('handles individual checkbox selection correctly', () => {
    render(<ContactDataFormWithState />)

    // Uncheck All
    userEvent.click(screen.getByLabelText('Poll Selection'))
    userEvent.click(screen.getByLabelText('Subscription'))
    userEvent.click(screen.getByLabelText('Text Submission'))
    userEvent.click(screen.getByLabelText('Multiselect Responses'))
    waitFor(() => {
      expect(screen.getByTestId('selected-fields')).toBeEmptyDOMElement()
    })

    // Check Poll Selection
    userEvent.click(screen.getByLabelText('Poll Selection'))
    waitFor(() => {
      expect(screen.getByLabelText('Poll Selection')).toBeChecked()
      expect(screen.getByLabelText('All')).not.toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent'
      )
    })

    // Check Subscription
    userEvent.click(screen.getByLabelText('Subscription'))
    waitFor(() => {
      expect(screen.getByLabelText('Subscription')).toBeChecked()
      expect(screen.getByLabelText('All')).not.toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent, SignUpSubmissionEvent'
      )
    })

    // Check Text Submission
    userEvent.click(screen.getByLabelText('Text Submission'))
    waitFor(() => {
      expect(screen.getByLabelText('Text Submission')).toBeChecked()
      expect(screen.getByLabelText('All')).not.toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent, SignUpSubmissionEvent, TextResponseSubmissionEvent'
      )
    })

    // Check Multiselect Responses
    userEvent.click(screen.getByLabelText('Multiselect Responses'))
    waitFor(() => {
      expect(screen.getByLabelText('Multiselect Responses')).toBeChecked()
      expect(screen.getByLabelText('All')).toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent, SignUpSubmissionEvent, TextResponseSubmissionEvent, MultiselectSubmissionEvent'
      )
    })
  })
})
