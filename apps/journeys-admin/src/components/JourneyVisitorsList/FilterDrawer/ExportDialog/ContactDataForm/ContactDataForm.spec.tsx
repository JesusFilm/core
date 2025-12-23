import { render, screen, waitFor } from '@testing-library/react'
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

  it('handles "Select All" checkbox correctly', async () => {
    render(<ContactDataFormWithState />)
    const user = userEvent.setup()
    const selectAllCheckbox = screen.getByLabelText('All')

    // Uncheck all
    await user.click(selectAllCheckbox)
    await waitFor(() => {
      expect(selectAllCheckbox).not.toBeChecked()
      expect(screen.getByLabelText('Poll Selection')).not.toBeChecked()
      expect(screen.getByLabelText('Subscription')).not.toBeChecked()
      expect(screen.getByLabelText('Text Submission')).not.toBeChecked()
      expect(screen.getByLabelText('Multiselect Responses')).not.toBeChecked()
    })

    // Check all again
    await user.click(selectAllCheckbox)
    await waitFor(() => {
      expect(selectAllCheckbox).toBeChecked()
      expect(screen.getByLabelText('Poll Selection')).toBeChecked()
      expect(screen.getByLabelText('Subscription')).toBeChecked()
      expect(screen.getByLabelText('Text Submission')).toBeChecked()
      expect(screen.getByLabelText('Multiselect Responses')).toBeChecked()
    })
  })

  it('handles individual checkbox selection correctly', async () => {
    render(<ContactDataFormWithState />)
    const user = userEvent.setup()

    // Uncheck All
    await user.click(screen.getByLabelText('Poll Selection'))
    await user.click(screen.getByLabelText('Subscription'))
    await user.click(screen.getByLabelText('Text Submission'))
    await user.click(screen.getByLabelText('Multiselect Responses'))
    await waitFor(() => {
      expect(screen.getByTestId('selected-fields')).toBeEmptyDOMElement()
    })

    // Check Poll Selection
    await user.click(screen.getByLabelText('Poll Selection'))
    await waitFor(() => {
      expect(screen.getByLabelText('Poll Selection')).toBeChecked()
      expect(screen.getByLabelText('All')).not.toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent'
      )
    })

    // Check Subscription
    await user.click(screen.getByLabelText('Subscription'))
    await waitFor(() => {
      expect(screen.getByLabelText('Subscription')).toBeChecked()
      expect(screen.getByLabelText('All')).not.toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent, SignUpSubmissionEvent'
      )
    })

    // Check Text Submission
    await user.click(screen.getByLabelText('Text Submission'))
    await waitFor(() => {
      expect(screen.getByLabelText('Text Submission')).toBeChecked()
      expect(screen.getByLabelText('All')).not.toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent, SignUpSubmissionEvent, TextResponseSubmissionEvent'
      )
    })

    // Check Multiselect Responses
    await user.click(screen.getByLabelText('Multiselect Responses'))
    await waitFor(() => {
      expect(screen.getByLabelText('Multiselect Responses')).toBeChecked()
      expect(screen.getByLabelText('All')).toBeChecked()
      expect(screen.getByTestId('selected-fields')).toHaveTextContent(
        'RadioQuestionSubmissionEvent, SignUpSubmissionEvent, TextResponseSubmissionEvent, MultiselectSubmissionEvent'
      )
    })
  })
})
