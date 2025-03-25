import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { StudyQuestionForm } from './StudyQuestionForm'

describe('StudyQuestionForm', () => {
  it('should render create form', () => {
    const handleSubmit = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <StudyQuestionForm
          initialValues={{ value: '' }}
          onSubmit={handleSubmit}
          variant="create"
        />
      </NextIntlClientProvider>
    )

    expect(screen.getByLabelText('Study Question')).toBeInTheDocument()
    const addButton = screen.getByRole('button', { name: 'Add' })
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveAttribute('color', 'secondary')
    expect(addButton).toHaveClass('MuiButton-outlined')
  })

  it('should render edit form', () => {
    const handleSubmit = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <StudyQuestionForm
          initialValues={{ value: 'Test question' }}
          onSubmit={handleSubmit}
          variant="edit"
        />
      </NextIntlClientProvider>
    )

    expect(screen.getByLabelText('Study Question')).toHaveValue('Test question')
    const updateButton = screen.getByRole('button', { name: 'Update' })
    expect(updateButton).toBeInTheDocument()
    expect(updateButton).toHaveAttribute('color', 'secondary')
    expect(updateButton).toHaveClass('MuiButton-outlined')
  })

  it('should validate required field', async () => {
    const handleSubmit = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <StudyQuestionForm
          initialValues={{ value: '' }}
          onSubmit={handleSubmit}
        />
      </NextIntlClientProvider>
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
      <NextIntlClientProvider locale="en">
        <StudyQuestionForm
          initialValues={{ value: '' }}
          onSubmit={handleSubmit}
        />
      </NextIntlClientProvider>
    )

    fireEvent.change(screen.getByLabelText('Study Question'), {
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
      <NextIntlClientProvider locale="en">
        <StudyQuestionForm
          initialValues={{ value: 'Test question' }}
          onSubmit={handleSubmit}
          loading={true}
        />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
