import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useField } from 'formik'
import { NextIntlClientProvider } from 'next-intl'

import { SubtitleFileUpload } from './SubtitleFileUpload'

const fieldMockVtt = { value: null, name: 'vttFile' }
const fieldMockSrt = { value: null, name: 'srtFile' }
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render VTT file', async () => {
    const fileVtt = new File(['test'], 'test.vtt', { type: 'text/vtt' })
    useFieldMock.mockImplementationOnce(() => [
      { ...fieldMockVtt, value: fileVtt }
    ])
    useFieldMock.mockImplementationOnce(() => [fieldMockSrt])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('File')).toBeInTheDocument()
      expect(screen.getByText('test.vtt')).toBeInTheDocument()
    })
  })

  it('should render SRT file', async () => {
    const fileSrt = new File(['test'], 'test.srt', {
      type: 'application/x-subrip'
    })
    useFieldMock.mockImplementationOnce(() => [fieldMockVtt])
    useFieldMock.mockImplementationOnce(() => [
      { ...fieldMockSrt, value: fileSrt }
    ])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('File')).toBeInTheDocument()
      expect(screen.getByText('test.srt')).toBeInTheDocument()
    })
  })

  it('should clear VTT file on delete', async () => {
    const fileVtt = new File(['test'], 'test.vtt', { type: 'text/vtt' })
    useFieldMock.mockImplementationOnce(() => [
      { ...fieldMockVtt, value: fileVtt },
      metaMock,
      { ...helpersMock }
    ])
    useFieldMock.mockImplementationOnce(() => [fieldMockSrt])

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

  it('should clear SRT file on delete', async () => {
    const fileSrt = new File(['test'], 'test.srt', {
      type: 'application/x-subrip'
    })
    useFieldMock.mockImplementationOnce(() => [fieldMockVtt])
    useFieldMock.mockImplementationOnce(() => [
      { ...fieldMockSrt, value: fileSrt },
      metaMock,
      { ...helpersMock }
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

  it('should update VTT value on file drop', async () => {
    useFieldMock.mockImplementationOnce(() => [
      fieldMockVtt,
      metaMock,
      { ...helpersMock }
    ])
    useFieldMock.mockImplementationOnce(() => [fieldMockSrt])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()
    const fileVtt = new File(['test'], 'test.vtt', { type: 'text/vtt' })

    await user.upload(screen.getByTestId('DropZone'), fileVtt)

    expect(helpersMock.setValue).toHaveBeenCalledWith(fileVtt)
  })

  it('should update SRT value on file drop', async () => {
    useFieldMock.mockImplementationOnce(() => [fieldMockVtt])
    useFieldMock.mockImplementationOnce(() => [
      fieldMockSrt,
      metaMock,
      { ...helpersMock }
    ])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()
    const fileSrt = new File(['test'], 'test.srt', {
      type: 'application/x-subrip'
    })

    await user.upload(screen.getByTestId('DropZone'), fileSrt)

    expect(helpersMock.setValue).toHaveBeenCalledWith(fileSrt)
  })

  it('should handle multiple files dropped together', async () => {
    const vttHelpersMock = { setValue: jest.fn() }
    const srtHelpersMock = { setValue: jest.fn() }

    useFieldMock.mockImplementationOnce(() => [
      fieldMockVtt,
      metaMock,
      vttHelpersMock
    ])
    useFieldMock.mockImplementationOnce(() => [
      fieldMockSrt,
      metaMock,
      srtHelpersMock
    ])

    render(
      <NextIntlClientProvider locale="en">
        <SubtitleFileUpload />
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()
    const fileVtt = new File(['test'], 'test.vtt', { type: 'text/vtt' })
    const fileSrt = new File(['test'], 'test.srt', {
      type: 'application/x-subrip'
    })

    await user.upload(screen.getByTestId('DropZone'), [fileVtt, fileSrt])

    expect(vttHelpersMock.setValue).toHaveBeenCalledWith(fileVtt)
    expect(srtHelpersMock.setValue).toHaveBeenCalledWith(fileSrt)
  })
})
