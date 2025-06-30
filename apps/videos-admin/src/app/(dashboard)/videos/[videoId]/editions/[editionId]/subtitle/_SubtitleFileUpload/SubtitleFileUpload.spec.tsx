import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useField } from 'formik'

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

interface Subtitle {
  vttSrc: string
  srtSrc: string
}

const originalCreateObjectURL = global.URL.createObjectURL
const useFieldMock = useField as jest.Mock

describe('SubtitleFileUpload', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
    jest.clearAllMocks()
  })

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectURL
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.URL.createObjectURL = originalCreateObjectURL
  })

  it('should render VTT file uploaded', async () => {
    const fileVtt = new File(['test'], 'test.vtt', { type: 'text/vtt' })
    useFieldMock.mockImplementationOnce(() => [
      { ...fieldMockVtt, value: fileVtt }
    ])
    useFieldMock.mockImplementationOnce(() => [fieldMockSrt])

    render(<SubtitleFileUpload />)

    await waitFor(() => {
      expect(screen.getByTestId('LinkFile')).toBeInTheDocument()
      expect(screen.getByText('test.vtt')).toBeInTheDocument()
    })
  })

  it('should render SRT file uploaded', async () => {
    const fileSrt = new File(['test'], 'test.srt', {
      type: 'application/x-subrip'
    })
    useFieldMock.mockImplementationOnce(() => [fieldMockVtt])
    useFieldMock.mockImplementationOnce(() => [
      { ...fieldMockSrt, value: fileSrt }
    ])

    render(<SubtitleFileUpload />)

    await waitFor(() => {
      expect(screen.getByTestId('LinkFile')).toBeInTheDocument()
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

    render(<SubtitleFileUpload />)
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

    render(<SubtitleFileUpload />)
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

    render(<SubtitleFileUpload />)

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

    render(<SubtitleFileUpload />)

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

    render(<SubtitleFileUpload />)

    const user = userEvent.setup()
    const fileVtt = new File(['test'], 'test.vtt', { type: 'text/vtt' })
    const fileSrt = new File(['test'], 'test.srt', {
      type: 'application/x-subrip'
    })

    await user.upload(screen.getByTestId('DropZone'), [fileVtt, fileSrt])

    expect(vttHelpersMock.setValue).toHaveBeenCalledWith(fileVtt)
    expect(srtHelpersMock.setValue).toHaveBeenCalledWith(fileSrt)
  })

  it('should render existing VTT subtitle', async () => {
    useFieldMock.mockImplementationOnce(() => [fieldMockVtt])
    useFieldMock.mockImplementationOnce(() => [fieldMockSrt])

    const subtitle = {
      vttSrc: 'https://example.com/subtitle.vtt'
    }

    render(<SubtitleFileUpload subtitle={subtitle as Subtitle} />)

    await waitFor(() => {
      expect(screen.getByTestId('LinkFile')).toBeInTheDocument()
      expect(screen.getByText('subtitle.vtt')).toBeInTheDocument()
      expect(screen.getByText('subtitle.vtt')).toHaveAttribute(
        'href',
        'https://example.com/subtitle.vtt'
      )
    })
  })

  it('should render existing SRT subtitle', async () => {
    useFieldMock.mockImplementationOnce(() => [fieldMockVtt])
    useFieldMock.mockImplementationOnce(() => [fieldMockSrt])

    const subtitle = {
      srtSrc: 'https://example.com/subtitle.srt'
    }

    render(<SubtitleFileUpload subtitle={subtitle as Subtitle} />)

    await waitFor(() => {
      expect(screen.getByTestId('LinkFile')).toBeInTheDocument()
      expect(screen.getByText('subtitle.srt')).toBeInTheDocument()
      expect(screen.getByText('subtitle.srt')).toHaveAttribute(
        'href',
        'https://example.com/subtitle.srt'
      )
    })
  })
})
