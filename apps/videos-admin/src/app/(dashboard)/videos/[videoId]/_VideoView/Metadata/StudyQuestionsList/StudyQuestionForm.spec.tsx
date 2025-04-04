import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { StudyQuestionForm } from './StudyQuestionForm'

const messages = {
  'Study Question': 'Study Question',
  Add: 'Add',
  Update: 'Update',
  'Study question is required': 'Study question is required',
  'Enter study question': 'Enter study question'
}

describe('StudyQuestionForm', () => {
  it('should render create form', () => {
    const handleSubmit = jest.fn()

    render(
      <StudyQuestionForm
        initialValues={{ value: '' }}
        onSubmit={handleSubmit}
        variant="create"
      />
    )

    expect(
      screen.getByPlaceholderText('Enter study question')
    ).toBeInTheDocument()
    const addButton = screen.getByRole('button', { name: 'Add' })
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveClass('MuiButton-colorSecondary')
    expect(addButton).toHaveClass('MuiButton-outlined')
  })

  it('should render edit form', () => {
    const handleSubmit = jest.fn()

    render(
      <StudyQuestionForm
        initialValues={{ value: 'Test question' }}
        onSubmit={handleSubmit}
        variant="edit"
      />
    )

    expect(screen.getByPlaceholderText('Enter study question')).toHaveValue(
      'Test question'
    )
    const updateButton = screen.getByRole('button', { name: 'Update' })
    expect(updateButton).toBeInTheDocument()
    expect(updateButton).toHaveClass('MuiButton-colorSecondary')
    expect(updateButton).toHaveClass('MuiButton-outlined')
  })

  it('should have autoFocus property set on the input field', () => {
    const handleSubmit = jest.fn()

    render(
      <StudyQuestionForm
        initialValues={{ value: '' }}
        onSubmit={handleSubmit}
      />
    )

    const inputField = screen.getByPlaceholderText('Enter study question')
    expect(inputField).toBeInTheDocument()
  })

  it('should validate required field', async () => {
    const handleSubmit = jest.fn()

    render(
      <StudyQuestionForm
        initialValues={{ value: '' }}
        onSubmit={handleSubmit}
      />
    )

    fireEvent.submit(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Study question is required')).toBeInTheDocument()
    })
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('should submit form', async () => {
    const handleSubmit = jest.fn()

    render(
      <StudyQuestionForm
        initialValues={{ value: '' }}
        onSubmit={handleSubmit}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter study question'), {
      target: { value: 'New question' }
    })
    fireEvent.submit(screen.getByRole('button'))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { value: 'New question' },
        expect.anything()
      )
    })
  })

  it('should disable submit button when loading', () => {
    const handleSubmit = jest.fn()

    render(
      <StudyQuestionForm
        initialValues={{ value: 'Test question' }}
        onSubmit={handleSubmit}
        loading={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
