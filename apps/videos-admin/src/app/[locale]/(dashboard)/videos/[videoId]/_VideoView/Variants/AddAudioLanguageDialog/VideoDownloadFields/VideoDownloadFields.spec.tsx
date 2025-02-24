import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Form, Formik } from 'formik'
import { NextIntlClientProvider } from 'next-intl'

import { VideoDownloadFields } from './VideoDownloadFields'

describe('VideoDownloadFields', () => {
  const initialValues = {
    quality: '',
    width: '',
    height: ''
  }

  it('should render quality, width and height fields', () => {
    render(
      <NextIntlClientProvider locale="en">
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Form>
            <VideoDownloadFields />
          </Form>
        </Formik>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('QualitySelect')).toBeInTheDocument()
    expect(screen.getByLabelText('Width')).toBeInTheDocument()
    expect(screen.getByLabelText('Height')).toBeInTheDocument()
  })

  it('should update quality field', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          {({ values }) => (
            <Form>
              <VideoDownloadFields />
              <div data-testid="form-values">{values.quality}</div>
            </Form>
          )}
        </Formik>
      </NextIntlClientProvider>
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('option', { name: 'Low' }))
    await waitFor(() => {
      expect(screen.getByTestId('form-values')).toHaveTextContent('low')
    })
  })

  it('should update width and height fields', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Form>
            <VideoDownloadFields />
          </Form>
        </Formik>
      </NextIntlClientProvider>
    )

    const widthInput = screen.getByLabelText('Width')
    const heightInput = screen.getByLabelText('Height')

    fireEvent.change(widthInput, { target: { value: '1920' } })
    fireEvent.change(heightInput, { target: { value: '1080' } })

    await waitFor(() => {
      expect(widthInput).toHaveValue(1920)
      expect(heightInput).toHaveValue(1080)
    })
  })

  it('should show error states when fields are touched with errors', async () => {
    const errors = {
      quality: 'Quality is required',
      width: 'Width is required',
      height: 'Height is required'
    }

    render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <Formik
          initialValues={initialValues}
          initialErrors={errors}
          initialTouched={{
            quality: true,
            width: true,
            height: true
          }}
          onSubmit={jest.fn()}
        >
          {({ errors: formErrors }) => (
            <Form>
              <VideoDownloadFields />
              <div data-testid="error-state">
                {Object.values(formErrors).join(',')}
              </div>
            </Form>
          )}
        </Formik>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('error-state')).toHaveTextContent(
      'Quality is required'
    )
    expect(screen.getByTestId('error-state')).toHaveTextContent(
      'Width is required'
    )
    expect(screen.getByTestId('error-state')).toHaveTextContent(
      'Height is required'
    )

    expect(screen.getByLabelText('Width')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    expect(screen.getByLabelText('Height')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })
})
