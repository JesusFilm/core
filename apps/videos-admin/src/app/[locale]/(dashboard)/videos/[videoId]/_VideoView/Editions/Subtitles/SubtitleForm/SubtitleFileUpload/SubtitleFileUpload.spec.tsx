import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useField } from 'formik'
import { NextIntlClientProvider } from 'next-intl'

import { SubtitleFileUpload } from './SubtitleFileUpload'

const fieldMock = { value: null, name: 'file' }
const metaMock = {
  value: null,
  error: '',
  touched: false,
  initialTouched: false
}
const helpersMock = {
  setValue: jest.fn()
}

jest.mock('formik', () => ({
  __esModule: true,
  useField: jest.fn()
}))

const useFieldMock = useField as jest.Mock

describe('SubtitleFileUpload', () => {
  it('should render', () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    expect(
      screen.getByText('Drag & drop or choose a file to upload')
    ).toBeInTheDocument()
  })

  it('should render file', () => {
    const file = new File(['test'], 'test.vtt', { type: 'text/vtt' })
    useFieldMock.mockImplementation(() => [
      { ...fieldMock, value: file },
      metaMock,
      helpersMock
    ])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('File')).toBeInTheDocument()
    expect(screen.getByText('test.vtt')).toBeInTheDocument()
  })

  it('should clear file on delete', async () => {
    const file = new File(['test'], 'test.vtt', { type: 'text/vtt' })
    useFieldMock.mockImplementation(() => [
      { ...fieldMock, value: file },
      metaMock,
      helpersMock
    ])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )
    const user = userEvent.setup()

    const button = screen.getByRole('button', { name: 'delete-file' })
    expect(button).toBeInTheDocument()

    await user.click(button)

    expect(helpersMock.setValue).toHaveBeenCalledWith(null)
  })

  it('should update value on file drop', async () => {
    useFieldMock.mockImplementation(() => [fieldMock, metaMock, helpersMock])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const file = new File(['test'], 'test.vtt', { type: 'text/vtt' })

    await user.upload(screen.getByTestId('DropZone'), file)

    expect(helpersMock.setValue).toHaveBeenCalledWith(file)
  })
})
